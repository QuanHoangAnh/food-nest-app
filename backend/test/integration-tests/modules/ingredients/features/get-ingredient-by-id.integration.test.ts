import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { IngredientDto } from '@app/modules/ingredients/dtos/ingredient-dto';
import {
  GetIngredientByIdQuery,
  GetIngredientByIdResult,
} from '@app/modules/ingredients/features/getting-ingredient-by-id/get-ingredient-by-id';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { AppSharedFixture } from '../../../../shared/app-shared-fixture';
import { FakeIngredient } from '../../../../shared/fakes/fake-ingredient';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('GetIngredientByIdHandler (Integration)', () => {
  let queryBus: QueryBus;
  let repo: IIngredientRepository;

  beforeAll(async () => {
    logger.log('Initializing GetIngredientByIdHandler integration test...');
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

  describe('Given ingredient exists', () => {
    it('should return ingredient DTO successfully', async () => {
      // Arrange
      const fake = FakeIngredient.generate();
      const saved = await repo.save(fake);

      const query = GetIngredientByIdQuery.of(saved.id);

      // Act
      const result = await queryBus.execute<GetIngredientByIdQuery, GetIngredientByIdResult>(query);

      // Assert
      expect(result).toBeInstanceOf(GetIngredientByIdResult);
      expect(result.ingredient).toBeInstanceOf(IngredientDto);

      const dto = result.ingredient;
      expect(dto.id).toBe(saved.id);
      expect(dto.name).toBe(fake.name);
      expect(dto.supplier).toBe(fake.supplier);
      expect(dto.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Given ingredient does not exist', () => {
    it('should throw NotFoundException', async () => {
      // Arrange
      const nonExistentId = uuidv7();
      const query = GetIngredientByIdQuery.of(nonExistentId);

      // Act & Assert
      await expect(queryBus.execute(query)).rejects.toThrow(NotFoundException);
      await expect(queryBus.execute(query)).rejects.toThrow(`Ingredient with ID '${nonExistentId}' not found.`);
    });
  });

  describe('Given invalid ID (null or whitespace)', () => {
    it('should throw ValidationException', () => {
      expect(() => GetIngredientByIdQuery.of(null as any)).toThrow(
        new ValidationException('Ingredient ID is required.'),
      );
      expect(() => GetIngredientByIdQuery.of('')).toThrow(new ValidationException('Ingredient ID is required.'));
      expect(() => GetIngredientByIdQuery.of('   ')).toThrow(new ValidationException('Ingredient ID is required.'));
    });
  });
});
