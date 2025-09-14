// delete-recipe.integration.spec.ts
import { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { DeleteRecipe, DeleteRecipeResult } from '@app/modules/recipes/features/deleting-recipe/delete-recipe';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { AppSharedFixture } from '../../../shared/app-shared-fixture';
import { FakeRecipe } from '../../../shared/fakes/fake-recipe';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('DeleteRecipeHandler (Integration)', () => {
  let commandBus: CommandBus;
  let repo: IRecipeRepository;

  beforeAll(async () => {
    logger.log('Initializing DeleteRecipeHandler integration test...');
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

  describe('Given valid ID', () => {
    it('should soft-delete recipe and return result', async () => {
      // Arrange
      const recipe = FakeRecipe.generate();
      const saved = await repo.save(recipe);

      const command = DeleteRecipe.of(saved.id);

      // Act
      const result = await commandBus.execute<DeleteRecipe, DeleteRecipeResult>(command);

      // Assert
      expect(result).toBeInstanceOf(DeleteRecipeResult);
      expect(result.id).toBe(saved.id);

      // Verify it's actually soft-deleted
      const deletedRecipe = await repo.findById(saved.id);
      // Should not find it (because findById filters by deletedAt: IsNull())
      expect(deletedRecipe).toBeNull();
    });
  });

  describe('Given recipe does not exist', () => {
    it('should throw NotFoundException', async () => {
      // Arrange
      const nonExistentId = uuidv7();
      const command = DeleteRecipe.of(nonExistentId);

      // Act & Assert
      await expect(commandBus.execute(command)).rejects.toThrow(NotFoundException);
      await expect(commandBus.execute(command)).rejects.toThrow(`Recipe with ID '${nonExistentId}' not found.`);
    });
  });

  describe('Given invalid ID', () => {
    it('should throw ValidationException', () => {
      expect(() => DeleteRecipe.of('')).toThrow(new ValidationException('Recipe ID is required.'));
      expect(() => DeleteRecipe.of(null as any)).toThrow(new ValidationException('Recipe ID is required.'));
      expect(() => DeleteRecipe.of('   ')).toThrow(new ValidationException('Recipe ID is required.'));
    });
  });
});
