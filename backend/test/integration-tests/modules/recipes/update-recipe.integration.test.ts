// update-recipe.integration.spec.ts
import { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { UpdateRecipe, UpdateRecipeResult } from '@app/modules/recipes/features/updating-recipe/update-recipe';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { AppSharedFixture } from '../../../shared/app-shared-fixture';
import { FakeRecipe } from '../../../shared/fakes/fake-recipe';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('UpdateRecipeHandler (Integration)', () => {
  let commandBus: CommandBus;
  let repo: IRecipeRepository;

  beforeAll(async () => {
    logger.log('Initializing UpdateRecipeHandler integration test...');
    await sharedFixture.initialize();
    commandBus = sharedFixture.getHandler(CommandBus);
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

  describe('Given valid ID and name update', () => {
    it('should update name and return result', async () => {
      // Arrange
      const recipe = FakeRecipe.generate({ name: 'Old Name' });
      const saved = await repo.save(recipe);

      const command = UpdateRecipe.of(saved.id, 'New Name', undefined);

      // Act
      const result = await commandBus.execute<UpdateRecipe, UpdateRecipeResult>(command);

      // Assert
      expect(result).toBeInstanceOf(UpdateRecipeResult);
      expect(result.id).toBe(saved.id);
      expect(result.name).toBe('New Name');
      expect(result.lastModifiedAt).toBeInstanceOf(Date);
    });
  });

  describe('Given valid ID and description update', () => {
    it('should update description and return result', async () => {
      // Arrange
      const recipe = FakeRecipe.generate({ description: 'Old Description' });
      const saved = await repo.save(recipe);

      const command = UpdateRecipe.of(saved.id, undefined, 'New Description');

      // Act
      const result = await commandBus.execute<UpdateRecipe, UpdateRecipeResult>(command);

      // Assert
      expect(result).toBeInstanceOf(UpdateRecipeResult);
      expect(result.id).toBe(saved.id);
      expect(result.description).toBe('New Description');
      expect(result.lastModifiedAt).toBeInstanceOf(Date);
    });
  });

  describe('Given recipe does not exist', () => {
    it('should throw NotFoundException', async () => {
      // Arrange
      const nonExistentId = uuidv7();
      const command = UpdateRecipe.of(nonExistentId, 'New Name', undefined);

      // Act & Assert
      await expect(commandBus.execute(command)).rejects.toThrow(NotFoundException);
      await expect(commandBus.execute(command)).rejects.toThrow(`Recipe with ID '${nonExistentId}' not found.`);
    });
  });

  describe('Given invalid ID', () => {
    it('should throw ValidationException', () => {
      expect(() => UpdateRecipe.of('', 'name', null)).toThrow(new ValidationException('Recipe ID is required.'));
      expect(() => UpdateRecipe.of(null as any, 'name', null)).toThrow(
        new ValidationException('Recipe ID is required.'),
      );
      expect(() => UpdateRecipe.of('   ', 'name', null)).toThrow(new ValidationException('Recipe ID is required.'));
    });
  });

  describe('Given no fields to update', () => {
    it('should throw error if neither name nor description is provided', () => {
      const recipeId = uuidv7();
      expect(() => UpdateRecipe.of(recipeId, undefined, undefined)).toThrow(
        'At least one field (name or description) must be provided for update.',
      );
    });
  });
});
