import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';

import { AppSharedFixture } from '../../../shared/app-shared-fixture';
import { FakeIngredient } from '../../../shared/fakes/fake-ingredient';
import { FakeRecipe } from '../../../shared/fakes/fake-recipe';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('GetRecipeByIdWithCostController (e2e)', () => {
  let app: INestApplication;
  let recipeRepo: IRecipeRepository;
  let ingredientRepo: IIngredientRepository;

  beforeAll(async () => {
    logger.log('Initializing GetRecipeByIdWithCostController e2e test...');
    await sharedFixture.initialize();
    app = sharedFixture.app!;
    await app.init();
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
    it('should return 200 with recipe and cost breakdown', async () => {
      // Arrange
      const flour = FakeIngredient.withPrices([{ price: 2.5 }], { name: 'Flour' });
      const sugar = FakeIngredient.withPrices([{ price: 1.8 }], { name: 'Sugar' });
      const savedFlour = await ingredientRepo.save(flour);
      const savedSugar = await ingredientRepo.save(sugar);

      const recipe = FakeRecipe.withIngredients(
        [
          { ingredientId: savedFlour.id, quantity: 0.2 },
          { ingredientId: savedSugar.id, quantity: 0.1 },
        ],
        { name: 'Chocolate Cake' },
      );
      const savedRecipe = await recipeRepo.save(recipe);

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/v1/recipes/${savedRecipe.id}/cost`)
        .expect(HttpStatus.OK);

      // Assert
      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('recipe');
      expect(response.body.recipe).toHaveProperty('recipe');
      expect(response.body.recipe).toHaveProperty('ingredients');

      const recipeDto = response.body.recipe.recipe;
      expect(recipeDto.id).toBe(savedRecipe.id);
      expect(recipeDto.name).toBe('Chocolate Cake');

      const ingredients = response.body.recipe.ingredients;
      expect(ingredients).toHaveLength(2);

      // Validate individual ingredient costs
      const flourIngredient = ingredients.find((ing: any) => ing.ingredientId === savedFlour.id);
      const sugarIngredient = ingredients.find((ing: any) => ing.ingredientId === savedSugar.id);

      expect(flourIngredient).toBeDefined();
      expect(sugarIngredient).toBeDefined();

      expect(Number(flourIngredient.unitPrice)).toBeCloseTo(2.5, 4);
      expect(Number(flourIngredient.quantity)).toBeCloseTo(0.2, 4);
      expect(Number(flourIngredient.lineCost)).toBeCloseTo(0.5, 4); // 0.2 * 2.5 = 0.5

      expect(Number(sugarIngredient.unitPrice)).toBeCloseTo(1.8, 4);
      expect(Number(sugarIngredient.quantity)).toBeCloseTo(0.1, 4);
      expect(Number(sugarIngredient.lineCost)).toBeCloseTo(0.18, 4); // 0.1 * 1.8 = 0.18
    });
  });

  describe('Given recipe exists but ingredient has no price', () => {
    it('should return 404 Not Found', async () => {
      // Arrange
      const flour = FakeIngredient.generate({ name: 'Flour' });
      const savedFlour = await ingredientRepo.save(flour);

      const recipe = FakeRecipe.withIngredients([{ ingredientId: savedFlour.id, quantity: 0.2 }], {
        name: 'Test Recipe',
      });
      const savedRecipe = await recipeRepo.save(recipe);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/recipes/${savedRecipe.id}/cost`)
        .expect(HttpStatus.NOT_FOUND);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.NOT_FOUND, 'No price found for ingredient ID');
    });
  });

  describe('Given recipe does not exist', () => {
    it('should return 404 Not Found', async () => {
      // Arrange
      const nonExistentId = uuidv7();

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/recipes/${nonExistentId}/cost`)
        .expect(HttpStatus.NOT_FOUND);

      sharedFixture.assertProblemDetails(
        response.body,
        HttpStatus.NOT_FOUND,
        `Recipe with ID '${nonExistentId}' not found.`,
      );
    });
  });
});
