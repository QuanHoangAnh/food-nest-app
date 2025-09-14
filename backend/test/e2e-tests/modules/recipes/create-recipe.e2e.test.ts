import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppSharedFixture } from '../../../shared/app-shared-fixture';
import { FakeCreateRecipeRequestDto } from '../../../shared/fakes/fake-create-recipe-request.dto';
import { FakeIngredient } from '../../../shared/fakes/fake-ingredient';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('CreateRecipeController (e2e)', () => {
  let app: INestApplication;
  let ingredientRepo: IIngredientRepository;

  beforeAll(async () => {
    logger.log('Initializing CreateRecipeController e2e test...');
    await sharedFixture.initialize();
    app = sharedFixture.app!;
    await app.init();
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

  describe('Given valid recipe data with existing ingredients', () => {
    it('should create recipe and return 201 with recipe ID', async () => {
      // Arrange
      const flour = await ingredientRepo.save(FakeIngredient.generate({ name: 'All-Purpose Flour' }));
      const sugar = await ingredientRepo.save(FakeIngredient.generate({ name: 'Granulated Sugar' }));

      const dto = FakeCreateRecipeRequestDto.generate({
        ingredients: [
          { ingredientId: flour.id, quantity: 0.2 },
          { ingredientId: sugar.id, quantity: 0.1 },
        ],
      });

      // Act
      const response = await request(app.getHttpServer()).post('/api/v1/recipes').send(dto).expect(HttpStatus.CREATED);

      // Assert
      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('recipeId');
      expect(response.body.recipeId).toMatch(/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i); // UUID format

      // Verify in DB
      const repo = sharedFixture.getHandler<IRecipeRepository>(RECIPE_REPOSITORY_TOKEN);
      const saved = await repo.findById(response.body.recipeId);
      expect(saved).toBeDefined();
      expect(saved!.name).toBe(dto.name);
      expect(saved!.description).toBe(dto.description);

      expect(saved!.ingredients).toHaveLength(2);
      expect(saved!.ingredients[0].ingredientId).toBe(flour.id);
      expect(Number(saved!.ingredients[0].quantity)).toBeCloseTo(0.2, 4);
      expect(Number(saved!.ingredients[1].quantity)).toBeCloseTo(0.1, 4);
    });
  });

  describe('Given invalid name (empty)', () => {
    it('should return 400 Bad Request', async () => {
      // Arrange
      const dto = FakeCreateRecipeRequestDto.generate({ name: '' });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/recipes')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.BAD_REQUEST, 'Recipe name is required.');
    });
  });

  describe('Given invalid ingredients (empty array)', () => {
    it('should return 400 Bad Request', async () => {
      // Arrange
      const dto = FakeCreateRecipeRequestDto.generate({ ingredients: [] });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/recipes')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.BAD_REQUEST, 'At least one ingredient is required.');
    });
  });

  describe('Given ingredient with invalid ID', () => {
    it('should return 400 Bad Request for empty ingredientId', async () => {
      // Arrange
      const dto = FakeCreateRecipeRequestDto.generate({
        ingredients: [{ ingredientId: '', quantity: 0.1 }],
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/recipes')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.BAD_REQUEST, 'Ingredient ID is required.');
    });
  });

  describe('Given ingredient with invalid quantity', () => {
    it('should return 400 Bad Request for zero quantity', async () => {
      // Arrange
      const flour = await ingredientRepo.save(FakeIngredient.generate({ name: 'Flour' }));
      const dto = FakeCreateRecipeRequestDto.generate({
        ingredients: [{ ingredientId: flour.id, quantity: 0 }],
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/recipes')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.BAD_REQUEST, 'Quantity must be greater than zero.');
    });

    it('should return 400 Bad Request for negative quantity', async () => {
      // Arrange
      const flour = await ingredientRepo.save(FakeIngredient.generate({ name: 'Flour' }));
      const dto = FakeCreateRecipeRequestDto.generate({
        ingredients: [{ ingredientId: flour.id, quantity: -0.1 }],
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/recipes')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.BAD_REQUEST, 'Quantity must be greater than zero.');
    });
  });

  describe('Given missing required fields', () => {
    it('should return 400 Bad Request for missing name', async () => {
      const { name, ...dtoWithoutName } = FakeCreateRecipeRequestDto.generate();

      const response = await request(app.getHttpServer())
        .post('/api/v1/recipes')
        .send(dtoWithoutName)
        .expect(HttpStatus.BAD_REQUEST);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.BAD_REQUEST, 'Recipe name is required.');
    });

    it('should return 400 Bad Request for missing ingredients', async () => {
      const { ingredients, ...dtoWithoutIngredients } = FakeCreateRecipeRequestDto.generate();

      const response = await request(app.getHttpServer())
        .post('/api/v1/recipes')
        .send(dtoWithoutIngredients)
        .expect(HttpStatus.BAD_REQUEST);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.BAD_REQUEST, 'At least one ingredient is required.');
    });
  });
});
