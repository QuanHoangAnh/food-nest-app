import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import {
  GetIngredientsByPageHandler,
  GetIngredientsByPageQuery,
  GetIngredientsByPageResult,
} from '@app/modules/ingredients/features/getting-ingredients/get-ingredients-by-page';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeIngredient } from '../../../../shared/fakes/fake-ingredient';

describe('GetIngredientsByPageHandler', () => {
  let handler: GetIngredientsByPageHandler;
  let repository: SubstituteOf<IIngredientRepository>;

  beforeEach(async () => {
    repository = Substitute.for<IIngredientRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetIngredientsByPageHandler,
        {
          provide: INGREDIENT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<GetIngredientsByPageHandler>(GetIngredientsByPageHandler);
  });

  describe('Given valid page and limit', () => {
    it('should return paginated ingredients', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const ingredients = Array.from({ length: 5 }, () => FakeIngredient.generate());
      const total = 25;

      const query = GetIngredientsByPageQuery.of(page, limit);

      repository.findAll(page, limit).returns(Promise.resolve({ items: ingredients, total }));

      // Act
      const result = await handler.execute(query);

      // Assert
      repository.received(1).findAll(page, limit);
      expect(result).toBeInstanceOf(GetIngredientsByPageResult);
      expect(result.items.length).toBe(5);
      expect(result.total).toBe(total);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);

      // Verify mapping
      const firstDto = result.items[0];
      const firstIngredient = ingredients[0];
      expect(firstDto.id).toBe(firstIngredient.id);
      expect(firstDto.name).toBe(firstIngredient.name);
    });
  });

  describe('Given invalid page', () => {
    it('should throw validation error when page is zero or negative', () => {
      expect(() => GetIngredientsByPageQuery.of(0, 10)).toThrow(new ValidationException('Page must be >= 1'));
      expect(() => GetIngredientsByPageQuery.of(-1, 10)).toThrow(new ValidationException('Page must be >= 1'));
    });
  });

  describe('Given invalid limit', () => {
    it('should throw validation error when limit is zero or negative', () => {
      expect(() => GetIngredientsByPageQuery.of(1, 0)).toThrow(new ValidationException('Limit must be >= 1'));
      expect(() => GetIngredientsByPageQuery.of(1, -5)).toThrow(new ValidationException('Limit must be >= 1'));
    });
  });

  describe('Given repository.findAll throws error', () => {
    it('should propagate error', async () => {
      // Arrange
      const query = GetIngredientsByPageQuery.of(1, 10);
      repository.findAll(1, 10).throws(new Error('Database error'));

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Database error');
    });
  });
});
