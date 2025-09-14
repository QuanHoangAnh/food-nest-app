import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { IngredientDto } from '@app/modules/ingredients/dtos/ingredient-dto';
import {
  GetIngredientsByPageQuery,
  GetIngredientsByPageResult,
} from '@app/modules/ingredients/features/getting-ingredients/get-ingredients-by-page';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { QueryBus } from '@nestjs/cqrs';

import { AppSharedFixture } from '../../../../shared/app-shared-fixture';
import { FakeIngredient } from '../../../../shared/fakes/fake-ingredient';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('GetIngredientsByPageHandler (Integration)', () => {
  let queryBus: QueryBus;
  let repo: IIngredientRepository;

  beforeAll(async () => {
    logger.log('Initializing GetIngredientsByPageHandler integration test...');
    await sharedFixture.initialize();
    queryBus = sharedFixture.getHandler(QueryBus);
    repo = sharedFixture.getHandler(INGREDIENT_REPOSITORY_TOKEN);
  });

  afterEach(async () => {
    logger.log('Cleaning up database...');
    await sharedFixture.cleanup();
  });

  afterAll(async () => {
    logger.log('Disposing test infrastructure...');
    await sharedFixture.dispose();
  });

  describe('Given no ingredients exist', () => {
    it('should return empty list with zero total count', async () => {
      // Arrange
      const query = GetIngredientsByPageQuery.of(1, 10);

      // Act
      const result = await queryBus.execute<GetIngredientsByPageQuery, GetIngredientsByPageResult>(query);

      // Assert
      expect(result).toBeInstanceOf(GetIngredientsByPageResult);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('Given ingredients exist and page is within range', () => {
    it('should return correct page of ingredients with accurate metadata', async () => {
      // Arrange
      // Reverse to match `createdAt: DESC`
      const ingredients = [
        FakeIngredient.generate({ name: 'Flour', supplier: 'Bobs Mill' }),
        FakeIngredient.generate({ name: 'Sugar', supplier: 'SweetCo' }),
        FakeIngredient.generate({ name: 'Cocoa', supplier: 'ChocoDelight' }),
        FakeIngredient.generate({ name: 'Vanilla', supplier: 'Bean Bros' }),
        FakeIngredient.generate({ name: 'Salt', supplier: 'SeaSalt Co' }),
      ];

      for (const ingredient of ingredients) {
        await repo.save(ingredient);
      }

      const query = GetIngredientsByPageQuery.of(1, 3);

      // Act
      const result = await queryBus.execute<GetIngredientsByPageQuery, GetIngredientsByPageResult>(query);

      // Assert
      expect(result).toBeInstanceOf(GetIngredientsByPageResult);
      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);

      // Validate DTOs
      const firstIngredient = result.items[0];
      expect(firstIngredient).toBeInstanceOf(IngredientDto);
      expect(firstIngredient.name).toBe(ingredients.at(-1)!.name);
      expect(firstIngredient.supplier).toBe(ingredients.at(-1)!.supplier);
    });
  });

  describe('Given page number is out of range (too high)', () => {
    it('should return empty ingredient list but correct metadata', async () => {
      // Arrange
      const ingredient = FakeIngredient.generate();
      await repo.save(ingredient);

      const query = GetIngredientsByPageQuery.of(999, 10);

      // Act
      const result = await queryBus.execute<GetIngredientsByPageQuery, GetIngredientsByPageResult>(query);

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(1);
      expect(result.page).toBe(999);
      expect(result.limit).toBe(10);
    });
  });

  describe('Given invalid page number (<=0)', () => {
    it('should throw ValidationException', () => {
      expect(() => GetIngredientsByPageQuery.of(0, 10)).toThrow(new ValidationException('Page must be >= 1'));
      expect(() => GetIngredientsByPageQuery.of(-1, 10)).toThrow(new ValidationException('Page must be >= 1'));
    });
  });

  describe('Given invalid limit (<=0)', () => {
    it('should throw ValidationException', () => {
      expect(() => GetIngredientsByPageQuery.of(1, 0)).toThrow(new ValidationException('Limit must be >= 1'));
      expect(() => GetIngredientsByPageQuery.of(1, -5)).toThrow(new ValidationException('Limit must be >= 1'));
    });
  });
});
