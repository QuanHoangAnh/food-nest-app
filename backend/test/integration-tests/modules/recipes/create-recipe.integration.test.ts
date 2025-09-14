import { CreateIngredient } from '@app/modules/ingredients/features/creating-ingredient/create-ingredient';
import { CreateRecipe, CreateRecipeResult } from '@app/modules/recipes/features/creating-recipe/create-recipe';
import { faker } from '@faker-js/faker';
import { CommandBus } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { AppSharedFixture } from '../../../shared/app-shared-fixture';
import { FakeIngredient } from '../../../shared/fakes/fake-ingredient';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('CreateRecipeHandler (Integration)', () => {
  let commandBus: CommandBus;

  beforeAll(async () => {
    logger.log('Initializing CreateRecipeHandler integration test...');
    await sharedFixture.initialize();
    commandBus = sharedFixture.getHandler(CommandBus);
  });

  afterEach(async () => {
    logger.log('Cleaning up database...');
    await sharedFixture.cleanup();
  });

  afterAll(async () => {
    logger.log('Disposing test infrastructure...');
    await sharedFixture.dispose();
  });

  describe('Given valid recipe data', () => {
    it('should create recipe with ingredients successfully and return result', async () => {
      // Arrange
      const ingredient1 = FakeIngredient.generate({ name: 'Flour', supplier: 'Bob’s Mill' });
      const ingredient2 = FakeIngredient.generate({ name: 'Sugar', supplier: 'SweetCo' });

      await commandBus.execute(CreateIngredient.of(ingredient1.name, ingredient1.supplier, undefined));
      await commandBus.execute(CreateIngredient.of(ingredient2.name, ingredient2.supplier, undefined));

      const recipeName = 'Chocolate Cake';
      const recipeDescription = 'A rich chocolate cake with vanilla frosting.';
      const ingredients = [
        { ingredientId: ingredient1.id, quantity: 2.5 },
        { ingredientId: ingredient2.id, quantity: 0.8 },
      ];

      const command = CreateRecipe.of(recipeName, recipeDescription, ingredients);

      // Act
      const result = await commandBus.execute<CreateRecipe, CreateRecipeResult>(command);

      // Assert
      expect(result).toBeInstanceOf(CreateRecipeResult);
      expect(result.name).toBe(recipeName);
      expect(result.description).toBe(recipeDescription);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Given ingredient ID does not exist', () => {
    it('should allow creation even if ingredient doesn’t exist (FK handled at DB level)', async () => {
      // Arrange
      const recipeName = 'Mystery Pie';
      const ingredients = [{ ingredientId: uuidv7(), quantity: 1.0 }];
      const command = CreateRecipe.of(recipeName, null, ingredients);

      // Act & Assert
      await expect(commandBus.execute(command)).resolves.toBeInstanceOf(CreateRecipeResult);
    });
  });

  describe('Given duplicate recipe name', () => {
    it('should NOT prevent creation if no unique constraint on name', async () => {
      // Arrange
      const recipeName = 'Spaghetti Bolognese';
      const ingredients = [{ ingredientId: faker.string.uuid(), quantity: 0.5 }];

      const firstCommand = CreateRecipe.of(recipeName, null, ingredients);
      await commandBus.execute(firstCommand);

      const secondCommand = CreateRecipe.of(recipeName, null, ingredients);

      // Act & Assert
      await expect(commandBus.execute(secondCommand)).resolves.toBeInstanceOf(CreateRecipeResult);
    });
  });
});
