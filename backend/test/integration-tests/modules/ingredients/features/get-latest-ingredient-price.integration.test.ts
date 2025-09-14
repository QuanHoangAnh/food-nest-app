import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import {
  GetLatestIngredientPriceQuery,
  GetLatestIngredientPriceResult,
} from '@app/modules/ingredients/features/getting-latest-ingredient-price/get-latest-ingredient-price';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { AppSharedFixture } from '../../../../shared/app-shared-fixture';
import { FakeIngredient } from '../../../../shared/fakes/fake-ingredient';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('GetLatestIngredientPriceHandler (Integration)', () => {
  let queryBus: QueryBus;
  let repo: IIngredientRepository;

  beforeAll(async () => {
    logger.log('Initializing GetLatestPriceHandler integration test...');
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

  describe('Given ingredient exists with price history', () => {
    it('should return latest price successfully', async () => {
      // Arrange
      const ingredient = FakeIngredient.withPrices(
        [
          { price: 1.5, date: new Date('2024-01-01') },
          { price: 1.8, date: new Date('2024-06-01') },
        ],
        { name: 'Flour' },
      );
      const saved = await repo.save(ingredient);

      const query = GetLatestIngredientPriceQuery.of(saved.id);

      // Act
      const result = await queryBus.execute<GetLatestIngredientPriceQuery, GetLatestIngredientPriceResult>(query);

      // Assert
      expect(result).toBeInstanceOf(GetLatestIngredientPriceResult);
      expect(result.latestPrice).toBe('1.80');
      expect(result.ingredientId).toBe(saved.id);
    });
  });

  describe('Given ingredient exists but has no price history', () => {
    it('should return null for price', async () => {
      // Arrange
      const ingredient = FakeIngredient.generate({ name: 'New Spice' });
      const saved = await repo.save(ingredient);

      const query = GetLatestIngredientPriceQuery.of(saved.id);

      // Act
      const result = await queryBus.execute<GetLatestIngredientPriceQuery, GetLatestIngredientPriceResult>(query);

      // Assert
      expect(result).toBeInstanceOf(GetLatestIngredientPriceResult);
      expect(result.latestPrice).toBeNull();
      expect(result.ingredientId).toBe(saved.id);
    });
  });

  describe('Given ingredient does not exist', () => {
    it('should throw NotFoundException', async () => {
      // Arrange
      const nonExistentId = uuidv7();
      const query = GetLatestIngredientPriceQuery.of(nonExistentId);

      // Act & Assert
      await expect(queryBus.execute(query)).rejects.toThrow(NotFoundException);
      await expect(queryBus.execute(query)).rejects.toThrow(`Ingredient with ID '${nonExistentId}' not found.`);
    });
  });

  describe('Given invalid ingredient ID', () => {
    it('should throw ValidationException', () => {
      expect(() => GetLatestIngredientPriceQuery.of('')).toThrow(new ValidationException('Ingredient ID is required.'));
      expect(() => GetLatestIngredientPriceQuery.of(null as any)).toThrow(
        new ValidationException('Ingredient ID is required.'),
      );
    });
  });
});
