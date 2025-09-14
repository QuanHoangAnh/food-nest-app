// update-recipe.handler.spec.ts
import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import {
  UpdateRecipe,
  UpdateRecipeHandler,
  UpdateRecipeResult,
} from '@app/modules/recipes/features/updating-recipe/update-recipe';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { faker } from '@faker-js/faker';
import { Arg, Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeRecipe } from '../../../../shared/fakes/fake-recipe';

describe('UpdateRecipeHandler', () => {
  let handler: UpdateRecipeHandler;
  let repository: SubstituteOf<IRecipeRepository>;

  beforeEach(async () => {
    repository = Substitute.for<IRecipeRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRecipeHandler,
        {
          provide: RECIPE_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<UpdateRecipeHandler>(UpdateRecipeHandler);
  });

  describe('Given valid ID and at least one field', () => {
    it('should update name and return result', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const newName = faker.commerce.productName();
      const command = UpdateRecipe.of(recipeId, newName, undefined);

      const existingRecipe = FakeRecipe.generate({ id: recipeId, name: 'Old Name' });

      const updatedRecipe = FakeRecipe.generate({
        id: recipeId,
        name: newName,
        description: existingRecipe.description,
        lastModifiedAt: new Date(),
        version: 2,
      });

      repository.findById(recipeId).returns(Promise.resolve(existingRecipe));
      repository.save(Arg.any()).returns(Promise.resolve(updatedRecipe)); // 👈 Now returns Recipe instance

      // Act
      const result = await handler.execute(command);

      // Assert
      repository.received(1).findById(recipeId);
      repository
        .received(1)
        .save(Arg.is(r => r.id === recipeId && r.name === newName && r.description === existingRecipe.description));

      expect(result).toBeInstanceOf(UpdateRecipeResult);
      expect(result.id).toBe(recipeId);
      expect(result.name).toBe(newName);
    });

    it('should update description and return result', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const newDesc = faker.commerce.productDescription();
      const command = UpdateRecipe.of(recipeId, undefined, newDesc);

      const existingRecipe = FakeRecipe.generate({ id: recipeId, description: 'Old Desc' });

      const updatedRecipe = FakeRecipe.generate({
        id: recipeId,
        name: existingRecipe.name,
        description: newDesc,
        lastModifiedAt: new Date(),
        version: 2,
      });

      repository.findById(recipeId).returns(Promise.resolve(existingRecipe));
      repository.save(Arg.any()).returns(Promise.resolve(updatedRecipe));

      // Act
      const result = await handler.execute(command);

      // Assert
      repository.received(1).findById(recipeId);
      repository
        .received(1)
        .save(Arg.is(r => r.id === recipeId && r.description === newDesc && r.name === existingRecipe.name));

      expect(result).toBeInstanceOf(UpdateRecipeResult);
      expect(result.id).toBe(recipeId);
      expect(result.description).toBe(newDesc);
    });

    it('should update both name and description', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const newName = faker.commerce.productName();
      const newDesc = faker.commerce.productDescription();
      const command = UpdateRecipe.of(recipeId, newName, newDesc);

      const existingRecipe = FakeRecipe.generate({ id: recipeId });

      const updatedRecipe = FakeRecipe.generate({
        id: recipeId,
        name: newName,
        description: newDesc,
        lastModifiedAt: new Date(),
        version: 2,
      });

      repository.findById(recipeId).returns(Promise.resolve(existingRecipe));
      repository.save(Arg.any()).returns(Promise.resolve(updatedRecipe));

      // Act
      const result = await handler.execute(command);

      // Assert
      repository.received(1).findById(recipeId);
      repository.received(1).save(Arg.is(r => r.id === recipeId && r.name === newName && r.description === newDesc));

      expect(result).toBeInstanceOf(UpdateRecipeResult);
      expect(result.name).toBe(newName);
      expect(result.description).toBe(newDesc);
    });

    it('should throw NotFoundException if recipe not found', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const command = UpdateRecipe.of(recipeId, 'New Name', undefined);

      repository.findById(recipeId).returns(Promise.resolve(null));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(command)).rejects.toThrow(`Recipe with ID '${recipeId}' not found.`);
    });
  });

  describe('Given invalid ID', () => {
    it('should throw validation error when ID is null or whitespace', () => {
      expect(() => UpdateRecipe.of('', 'name', null)).toThrow(new ValidationException('Recipe ID is required.'));
      expect(() => UpdateRecipe.of(null as any, 'name', null)).toThrow(
        new ValidationException('Recipe ID is required.'),
      );
      expect(() => UpdateRecipe.of('   ', 'name', null)).toThrow(new ValidationException('Recipe ID is required.'));
    });
  });

  describe('Given no fields to update', () => {
    it('should throw error if neither name nor description is provided', () => {
      const recipeId = faker.string.uuid();
      expect(() => UpdateRecipe.of(recipeId, undefined, undefined)).toThrow(
        'At least one field (name or description) must be provided for update.',
      );
    });
  });
});
