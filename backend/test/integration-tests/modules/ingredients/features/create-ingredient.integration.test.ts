import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import {
  CreateIngredient,
  CreateIngredientResult,
} from '@app/modules/ingredients/features/creating-ingredient/create-ingredient';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { CommandBus } from '@nestjs/cqrs';

import { AppSharedFixture } from '../../../../shared/app-shared-fixture';
import { FakeIngredient } from '../../../../shared/fakes/fake-ingredient';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('CreateIngredientHandler (Integration)', () => {
  let commandBus: CommandBus;
  let repo: IIngredientRepository;

  beforeAll(async () => {
    logger.log('Initializing CreateIngredientHandler integration test...');
    await sharedFixture.initialize();
    commandBus = sharedFixture.getHandler(CommandBus);
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

  describe('Given valid ingredient data with no prices', () => {
    it('should create ingredient successfully and return result', async () => {
      // Arrange
      const fake = FakeIngredient.generate();
      const command = CreateIngredient.of(fake.name, fake.supplier, undefined); // No prices

      // Act
      const result = await commandBus.execute<CreateIngredient, CreateIngredientResult>(command);

      // Assert
      expect(result).toBeInstanceOf(CreateIngredientResult);
      expect(result.name).toBe(fake.name);
      expect(result.supplier).toBe(fake.supplier);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);

      // Verify no prices exist
      const saved = await repo.findById(result.id);
      expect(saved).not.toBeNull();
      expect(saved!.priceHistory).toHaveLength(0);
    });
  });

  describe('Given valid ingredient data with initial prices', () => {
    it('should create ingredient with prices and return result', async () => {
      // Arrange
      const fake = FakeIngredient.generate();
      const prices = [
        { price: 1.5, changedAt: '2024-01-01T00:00:00Z' },
        { price: 1.8, changedAt: '2024-06-01T00:00:00Z' },
      ];
      const command = CreateIngredient.of(fake.name, fake.supplier, prices);

      // Act
      const result = await commandBus.execute<CreateIngredient, CreateIngredientResult>(command);

      // Assert
      expect(result).toBeInstanceOf(CreateIngredientResult);
      expect(result.name).toBe(fake.name);

      // Verify prices were saved
      const saved = await repo.findById(result.id);
      expect(saved).not.toBeNull();
      expect(saved!.priceHistory).toHaveLength(2);

      const sortedPrices = saved!.priceHistory.sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());
      expect(Number(sortedPrices[0].price)).toBe(1.5);
      expect(sortedPrices[0].changedAt).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(Number(sortedPrices[1].price)).toBe(1.8);
      expect(sortedPrices[1].changedAt).toEqual(new Date('2024-06-01T00:00:00Z'));

      // Verify
      const latestPrice = await repo.getLatestPrice(result.id);
      expect(Number(latestPrice)).toBe(1.8);
    });

    it('should create ingredient with prices (without changedAt defaults to now)', async () => {
      // Arrange
      const fake = FakeIngredient.generate();
      const prices = [{ price: 2.99 }];
      const command = CreateIngredient.of(fake.name, fake.supplier, prices);

      // Act
      const result = await commandBus.execute<CreateIngredient, CreateIngredientResult>(command);

      // Assert
      expect(result).toBeInstanceOf(CreateIngredientResult);

      // Verify price was saved with current date
      const saved = await repo.findById(result.id);
      expect(saved).not.toBeNull();
      expect(saved!.priceHistory).toHaveLength(1);

      const priceEntry = saved!.priceHistory[0];
      expect(priceEntry.price).toBe((2.99).toString());
      expect(priceEntry.changedAt).toBeInstanceOf(Date);
      // Allow ±5 seconds for test timing
      const now = new Date();
      expect(Math.abs(priceEntry.changedAt.getTime() - now.getTime())).toBeLessThan(5000);
    });
  });
});
