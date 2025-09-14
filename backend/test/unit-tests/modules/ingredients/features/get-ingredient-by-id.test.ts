import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import {
  GetIngredientByIdHandler,
  GetIngredientByIdQuery,
  GetIngredientByIdResult,
} from '@app/modules/ingredients/features/getting-ingredient-by-id/get-ingredient-by-id';
import { IngredientsMapper } from '@app/modules/ingredients/ingredients.mapper';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { faker } from '@faker-js/faker';
import { Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeIngredient } from '../../../../shared/fakes/fake-ingredient';

describe('GetIngredientByIdHandler', () => {
  let handler: GetIngredientByIdHandler;
  let repository: SubstituteOf<IIngredientRepository>;

  beforeEach(async () => {
    repository = Substitute.for<IIngredientRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetIngredientByIdHandler,
        {
          provide: INGREDIENT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<GetIngredientByIdHandler>(GetIngredientByIdHandler);
  });

  describe('Given valid ingredient ID and ingredient exists', () => {
    it('should return mapped ingredient DTO', async () => {
      // Arrange
      const ingredientId = faker.string.uuid();
      const ingredient = FakeIngredient.generate({ id: ingredientId });

      const query = GetIngredientByIdQuery.of(ingredientId);

      repository.findById(ingredientId).returns(Promise.resolve(ingredient));

      // Act
      const result = await handler.execute(query);

      // Assert
      repository.received(1).findById(ingredientId);
      expect(result).toBeInstanceOf(GetIngredientByIdResult);

      const expectedDto = IngredientsMapper.ingredientToIngredientDto(ingredient);
      expect(result.ingredient).toEqual(expectedDto);
      expect(result.ingredient.id).toBe(ingredient.id);
      expect(result.ingredient.name).toBe(ingredient.name);
      expect(result.ingredient.supplier).toBe(ingredient.supplier);
      expect(result.ingredient.createdAt).toEqual(ingredient.createdAt);
    });
  });

  describe('Given ingredient does not exist', () => {
    it('should throw NotFoundException', async () => {
      // Arrange
      const ingredientId = faker.string.uuid();
      const query = GetIngredientByIdQuery.of(ingredientId);

      repository.findById(ingredientId).returns(Promise.resolve(null));

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(query)).rejects.toThrow(`Ingredient with ID '${ingredientId}' not found.`);
    });
  });

  describe('Given invalid ID', () => {
    it('should throw validation error when ID is null or whitespace', () => {
      expect(() => GetIngredientByIdQuery.of('')).toThrow(new ValidationException('Ingredient ID is required.'));
      expect(() => GetIngredientByIdQuery.of(null as any)).toThrow(
        new ValidationException('Ingredient ID is required.'),
      );
      expect(() => GetIngredientByIdQuery.of('   ')).toThrow(new ValidationException('Ingredient ID is required.'));
    });
  });

  describe('Given repository.findById throws error', () => {
    it('should propagate error', async () => {
      // Arrange
      const ingredientId = faker.string.uuid();
      const query = GetIngredientByIdQuery.of(ingredientId);

      repository.findById(ingredientId).throws(new Error('Database error'));

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Database error');
    });
  });
});
