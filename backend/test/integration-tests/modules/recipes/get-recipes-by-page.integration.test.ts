// get-recipes-by-page.integration.spec.ts
import { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import {
  GetRecipesByPageQuery,
  GetRecipesByPageResult,
} from '@app/modules/recipes/features/getting-recipes/get-recipes-by-page';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { QueryBus } from '@nestjs/cqrs';

import { AppSharedFixture } from '../../../shared/app-shared-fixture';
import { FakeRecipe } from '../../../shared/fakes/fake-recipe';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('GetRecipesByPageHandler (Integration)', () => {
  let queryBus: QueryBus;
  let repo: IRecipeRepository;

  beforeAll(async () => {
    logger.log('Initializing GetRecipesByPageHandler integration test...');
    await sharedFixture.initialize();
    queryBus = sharedFixture.getHandler(QueryBus);
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
    it('should return empty list with zero total count', async () => {
      // Arrange
      const query = GetRecipesByPageQuery.of(1, 10);

      // Act
      const result = await queryBus.execute<GetRecipesByPageQuery, GetRecipesByPageResult>(query);

      // Assert
      expect(result).toBeInstanceOf(GetRecipesByPageResult);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('Given recipes exist and page is within range', () => {
    it('should return correct page of recipes with accurate metadata', async () => {
      // Arrange
      const recipes = [
        FakeRecipe.generate({ name: 'Recipe A' }),
        FakeRecipe.generate({ name: 'Recipe B' }),
        FakeRecipe.generate({ name: 'Recipe C' }),
        FakeRecipe.generate({ name: 'Recipe D' }),
        FakeRecipe.generate({ name: 'Recipe E' }),
      ];
      for (const recipe of recipes) {
        await repo.save(recipe);
      }

      const query = GetRecipesByPageQuery.of(1, 3);

      // Act
      const result = await queryBus.execute<GetRecipesByPageQuery, GetRecipesByPageResult>(query);

      // Assert
      expect(result).toBeInstanceOf(GetRecipesByPageResult);
      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);

      // Validate DTOs
      expect(result.items[0].name).toBe(recipes.at(-1)!.name);
    });
  });

  describe('Given page number is out of range (too high)', () => {
    it('should return empty recipe list but correct metadata', async () => {
      // Arrange
      const recipe = FakeRecipe.generate();
      await repo.save(recipe);

      const query = GetRecipesByPageQuery.of(999, 10);

      // Act
      const result = await queryBus.execute<GetRecipesByPageQuery, GetRecipesByPageResult>(query);

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(1);
      expect(result.page).toBe(999);
      expect(result.limit).toBe(10);
    });
  });

  describe('Given invalid page number (<=0)', () => {
    it('should throw ValidationException', () => {
      expect(() => GetRecipesByPageQuery.of(0, 10)).toThrow(new ValidationException('Page must be >= 1'));
      expect(() => GetRecipesByPageQuery.of(-1, 10)).toThrow(new ValidationException('Page must be >= 1'));
    });
  });

  describe('Given invalid limit (<=0)', () => {
    it('should throw ValidationException', () => {
      expect(() => GetRecipesByPageQuery.of(1, 0)).toThrow(new ValidationException('Limit must be >= 1'));
      expect(() => GetRecipesByPageQuery.of(1, -5)).toThrow(new ValidationException('Limit must be >= 1'));
    });
  });
});
