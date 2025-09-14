import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import {
  GetRecipeByIdWithCostQuery,
  GetRecipeByIdWithCostResult,
} from '@app/modules/recipes/features/getting-recipe-by-id-with-cost/get-recipe-by-id-with-cost';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { AppSharedFixture } from '../../../shared/app-shared-fixture';
import { FakeIngredient } from '../../../shared/fakes/fake-ingredient';
import { FakeRecipe } from '../../../shared/fakes/fake-recipe';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('GetRecipeByIdWithCostHandler (Integration)', () => {
  let queryBus: QueryBus;
  let recipeRepo: IRecipeRepository;
  let ingredientRepo: IIngredientRepository;

  beforeAll(async () => {
    logger.log('Initializing GetRecipeByIdWithCostHandler integration test...');
    await sharedFixture.initialize();
    queryBus = sharedFixture.getHandler(QueryBus);
    recipeRepo = sharedFixture.getHandler(RECIPE_REPOSITORY_TOKEN);
    ingredientRepo = sharedFixture.getHandler(INGREDIENT_REPOSITORY_TOKEN);
  });

  afterEach(async () => {
    logger.log('Cleaning up database...');
    await sharedFixture.cleanup();
  });

  afterAll(async () => {
    logger.log('Disposing test infrastructure...');
    await sharedFixture.dispose();
  });

  describe('Given recipe exists with ingredients that have prices', () => {
    it('should return recipe with cost successfully', async () => {
      // Arrange
      const flour = FakeIngredient.withPrices([{ price: 2.5 }], { name: 'Flour' });
      const sugar = FakeIngredient.withPrices([{ price: 1.8 }], { name: 'Sugar' });
      const savedFlour = await ingredientRepo.save(flour);
      const savedSugar = await ingredientRepo.save(sugar);

      // Create recipe
      const recipe = FakeRecipe.withIngredients(
        [
          { ingredientId: savedFlour.id, quantity: 0.2 },
          { ingredientId: savedSugar.id, quantity: 0.1 },
        ],
        { name: 'Test Recipe' },
      );
      const savedRecipe = await recipeRepo.save(recipe);

      const query = GetRecipeByIdWithCostQuery.of(savedRecipe.id);

      // Act
      const result = await queryBus.execute<GetRecipeByIdWithCostQuery, GetRecipeByIdWithCostResult>(query);

      // Assert
      expect(result).toBeInstanceOf(GetRecipeByIdWithCostResult);
      expect(result.recipeWithCost.recipe.id).toBe(savedRecipe.id);
      expect(result.recipeWithCost.recipe.name).toBe('Test Recipe');

      // Should have 2 ingredients in cost breakdown
      expect(result.recipeWithCost.ingredients).toHaveLength(2);

      // Total cost should be: (0.2 * 2.5) + (0.1 * 1.8) = 0.5 + 0.18 = 0.68
      const totalCost = result.recipeWithCost.ingredients.reduce((sum, ing) => sum + ing.lineCost, 0);
      expect(totalCost).toBeCloseTo(0.68, 2);
    });
  });

  describe('Given recipe exists but ingredient has no price', () => {
    it('should throw NotFoundException', async () => {
      // Arrange
      // Create ingredient WITHOUT price
      const flour = FakeIngredient.generate({ name: 'Flour' });
      const savedFlour = await ingredientRepo.save(flour);

      // Create recipe
      const recipe = FakeRecipe.withIngredients([{ ingredientId: savedFlour.id, quantity: 0.2 }], {
        name: 'Test Recipe',
      });
      const savedRecipe = await recipeRepo.save(recipe);

      const query = GetRecipeByIdWithCostQuery.of(savedRecipe.id);

      // Act & Assert
      await expect(queryBus.execute(query)).rejects.toThrow(NotFoundException);
      await expect(queryBus.execute(query)).rejects.toThrow('No price found for ingredient ID');
    });
  });

  describe('Given recipe does not exist', () => {
    it('should throw NotFoundException', async () => {
      // Arrange
      const nonExistentId = uuidv7();
      const query = GetRecipeByIdWithCostQuery.of(nonExistentId);

      // Act & Assert
      await expect(queryBus.execute(query)).rejects.toThrow(NotFoundException);
      await expect(queryBus.execute(query)).rejects.toThrow(`Recipe with ID '${nonExistentId}' not found.`);
    });
  });

  describe('Given invalid ID (null or whitespace)', () => {
    it('should throw ValidationException', () => {
      expect(() => GetRecipeByIdWithCostQuery.of(null as any)).toThrow(
        new ValidationException('Recipe ID is required.'),
      );
      expect(() => GetRecipeByIdWithCostQuery.of('')).toThrow(new ValidationException('Recipe ID is required.'));
      expect(() => GetRecipeByIdWithCostQuery.of('   ')).toThrow(new ValidationException('Recipe ID is required.'));
    });
  });
});
