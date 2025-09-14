import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import {
  GetLatestIngredientPriceHandler,
  GetLatestIngredientPriceQuery,
  GetLatestIngredientPriceResult,
} from '@app/modules/ingredients/features/getting-latest-ingredient-price/get-latest-ingredient-price';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { faker } from '@faker-js/faker';
import { Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeIngredient } from '../../../../shared/fakes/fake-ingredient';

describe('GetLatestIngredientPriceHandler', () => {
  let handler: GetLatestIngredientPriceHandler;
  let repository: SubstituteOf<IIngredientRepository>;

  beforeEach(async () => {
    repository = Substitute.for<IIngredientRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLatestIngredientPriceHandler,
        {
          provide: INGREDIENT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<GetLatestIngredientPriceHandler>(GetLatestIngredientPriceHandler);
  });

  describe('Given valid ingredient ID and ingredient exists', () => {
    it('should return latest price', async () => {
      // Arrange
      const ingredientId = faker.string.uuid();
      const ingredient = FakeIngredient.generate({ id: ingredientId });
      const latestPrice = 15.99;

      const query = GetLatestIngredientPriceQuery.of(ingredientId);

      repository.findById(ingredientId).returns(Promise.resolve(ingredient));
      repository.getLatestPrice(ingredientId).returns(Promise.resolve(latestPrice));

      // Act
      const result = await handler.execute(query);

      // Assert
      repository.received(1).findById(ingredientId);
      repository.received(1).getLatestPrice(ingredientId);
      expect(result).toBeInstanceOf(GetLatestIngredientPriceResult);
      expect(result.ingredientId).toBe(ingredientId);
      expect(result.latestPrice).toBe(latestPrice);
    });
  });

  describe('Given ingredient does not exist', () => {
    it('should throw NotFoundException', async () => {
      // Arrange
      const ingredientId = faker.string.uuid();
      const query = GetLatestIngredientPriceQuery.of(ingredientId);

      repository.findById(ingredientId).returns(Promise.resolve(null));

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(query)).rejects.toThrow(`Ingredient with ID '${ingredientId}' not found.`);
    });
  });

  describe('Given invalid ID', () => {
    it('should throw validation error when ID is null or whitespace', () => {
      expect(() => GetLatestIngredientPriceQuery.of('')).toThrow(new ValidationException('Ingredient ID is required.'));
      expect(() => GetLatestIngredientPriceQuery.of(null as any)).toThrow(
        new ValidationException('Ingredient ID is required.'),
      );
      expect(() => GetLatestIngredientPriceQuery.of('   ')).toThrow(
        new ValidationException('Ingredient ID is required.'),
      );
    });
  });

  describe('Given repository.getLatestPrice returns null', () => {
    it('should return null as latest price', async () => {
      // Arrange
      const ingredientId = faker.string.uuid();
      const ingredient = FakeIngredient.generate({ id: ingredientId });
      const query = GetLatestIngredientPriceQuery.of(ingredientId);

      repository.findById(ingredientId).returns(Promise.resolve(ingredient));
      repository.getLatestPrice(ingredientId).returns(Promise.resolve(null));

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeInstanceOf(GetLatestIngredientPriceResult);
      expect(result.ingredientId).toBe(ingredientId);
      expect(result.latestPrice).toBeNull();
    });
  });
});
