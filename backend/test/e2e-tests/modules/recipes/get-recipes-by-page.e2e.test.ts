import { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppSharedFixture } from '../../../shared/app-shared-fixture';
import { FakeRecipe } from '../../../shared/fakes/fake-recipe';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('GetRecipesByPageController (e2e)', () => {
  let app: INestApplication;
  let repo: IRecipeRepository;

  beforeAll(async () => {
    logger.log('Initializing GetRecipesByPageController e2e test...');
    await sharedFixture.initialize();
    app = sharedFixture.app!;
    await app.init();
    repo = sharedFixture.getHandler(RECIPE_REPOSITORY_TOKEN);
  });

  afterEach(async () => {
    logger.log('Cleaning up database...');
    await sharedFixture.cleanup();
  });

  afterAll(async () => {
    logger.log('Disposing test infrastructure...');
    await sharedFixture.dispose();
  });

  describe('Given no recipes exist', () => {
    it('should return 200 with empty list', async () => {
      // Act
      const response = await request(app.getHttpServer()).get('/api/v1/recipes?page=1&limit=10').expect(HttpStatus.OK);

      // Assert
      expect(response.body).toBeDefined();
      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBe(0);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });
  });

  describe('Given recipes exist', () => {
    it('should return 200 with paginated results', async () => {
      // Arrange
      const recipes = [
        FakeRecipe.generate({ name: 'Recipe A' }),
        FakeRecipe.generate({ name: 'Recipe B' }),
        FakeRecipe.generate({ name: 'Recipe C' }),
      ];
      for (const recipe of recipes) {
        await repo.save(recipe);
      }

      // Act
      const response = await request(app.getHttpServer()).get('/api/v1/recipes?page=1&limit=2').expect(HttpStatus.OK);

      // Assert
      expect(response.body).toBeDefined();
      expect(response.body.items).toHaveLength(2);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
      expect(response.body.items[0].name).toBe(recipes.at(-1)!.name);
    });
  });

  describe('Given invalid page parameter', () => {
    it('should return 400 Bad Request for page <= 0', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/recipes?page=0&limit=10')
        .expect(HttpStatus.BAD_REQUEST);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.BAD_REQUEST, 'Page must be >= 1');
    });
  });

  describe('Given invalid limit parameter', () => {
    it('should return 400 Bad Request for limit <= 0', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/recipes?page=1&limit=0')
        .expect(HttpStatus.BAD_REQUEST);

      sharedFixture.assertProblemDetails(response.body, HttpStatus.BAD_REQUEST, 'Limit must be >= 1');
    });
  });
});
