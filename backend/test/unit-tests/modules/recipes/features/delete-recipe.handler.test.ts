import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import {
  DeleteRecipe,
  DeleteRecipeHandler,
  DeleteRecipeResult,
} from '@app/modules/recipes/features/deleting-recipe/delete-recipe';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { faker } from '@faker-js/faker';
import { Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('DeleteRecipeHandler', () => {
  let handler: DeleteRecipeHandler;
  let repository: SubstituteOf<IRecipeRepository>;

  beforeEach(async () => {
    repository = Substitute.for<IRecipeRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRecipeHandler,
        {
          provide: RECIPE_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<DeleteRecipeHandler>(DeleteRecipeHandler);
  });

  describe('Given valid ID', () => {
    it('should soft-delete recipe and return result', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const command = DeleteRecipe.of(recipeId);

      repository.findById(recipeId).returns(Promise.resolve({ id: recipeId } as any));
      repository.softDeleteById(recipeId).returns(Promise.resolve(true));

      // Act
      const result = await handler.execute(command);

      // Assert
      repository.received(1).findById(recipeId);
      repository.received(1).softDeleteById(recipeId);

      expect(result).toBeInstanceOf(DeleteRecipeResult);
      expect(result.id).toBe(recipeId);
    });

    it('should throw NotFoundException if recipe not found', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const command = DeleteRecipe.of(recipeId);

      repository.findById(recipeId).returns(Promise.resolve(null));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(command)).rejects.toThrow(`Recipe with ID '${recipeId}' not found.`);
    });

    it('should throw Error if soft-delete fails', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const command = DeleteRecipe.of(recipeId);

      repository.findById(recipeId).returns(Promise.resolve({ id: recipeId } as any));
      repository.softDeleteById(recipeId).returns(Promise.resolve(false));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(`Failed to soft-delete recipe ${recipeId}`);
    });
  });

  describe('Given invalid ID', () => {
    it('should throw validation error when ID is null or whitespace', () => {
      expect(() => DeleteRecipe.of('')).toThrow(new ValidationException('Recipe ID is required.'));
      expect(() => DeleteRecipe.of(null as any)).toThrow(new ValidationException('Recipe ID is required.'));
      expect(() => DeleteRecipe.of('   ')).toThrow(new ValidationException('Recipe ID is required.'));
    });
  });
});
