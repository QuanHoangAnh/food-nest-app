import { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import {
  AddPriceToIngredient,
  AddPriceToIngredientResult,
} from '@app/modules/ingredients/features/adding-price-to-ingredient/add-price-to-ingredient';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { AppSharedFixture } from '../../../../shared/app-shared-fixture';
import { FakeIngredient } from '../../../../shared/fakes/fake-ingredient';

const sharedFixture = new AppSharedFixture();
const logger = sharedFixture.getLogger();

describe('AddPriceToIngredientHandler (Integration)', () => {
  let commandBus: CommandBus;
  let repo: IIngredientRepository;

  beforeAll(async () => {
    logger.log('Initializing AddPriceToIngredientHandler integration test...');
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

  describe('Given valid ingredient ID and price', () => {
    it('should add price history and return result', async () => {
      // Arrange
      const ingredient = FakeIngredient.generate();
      const saved = await repo.save(ingredient);

      const newPrice = 2.99;
      const command = AddPriceToIngredient.of(saved.id, newPrice);

      // Act
      const result = await commandBus.execute<AddPriceToIngredient, AddPriceToIngredientResult>(command);

      // Assert
      expect(result).toBeInstanceOf(AddPriceToIngredientResult);
      expect(result.ingredientId).toBe(saved.id);
      expect(result.price).toBe(newPrice);
      expect(result.changedAt).toBeInstanceOf(Date);

      // Verify price was actually saved
      const latestPrice = await repo.getLatestPrice(saved.id);
      expect(latestPrice).toBe(newPrice.toString());
    });
  });

  describe('Given ingredient does not exist', () => {
    it('should throw NotFoundException', async () => {
      // Arrange
      const nonExistentId = uuidv7();
      const command = AddPriceToIngredient.of(nonExistentId, 1.99);

      // Act & Assert
      await expect(commandBus.execute(command)).rejects.toThrow(NotFoundException);
      await expect(commandBus.execute(command)).rejects.toThrow(`Ingredient with ID '${nonExistentId}' not found.`);
    });
  });

  describe('Given invalid ingredient ID', () => {
    it('should throw ValidationException', () => {
      expect(() => AddPriceToIngredient.of('', 1.99)).toThrow(new ValidationException('Ingredient ID is required.'));
      expect(() => AddPriceToIngredient.of(null as any, 1.99)).toThrow(
        new ValidationException('Ingredient ID is required.'),
      );
    });
  });

  describe('Given invalid price (<=0)', () => {
    it('should throw ValidationException', async () => {
      // Arrange
      const ingredient = FakeIngredient.generate();
      const saved = await repo.save(ingredient);

      // Act & Assert
      expect(() => AddPriceToIngredient.of(saved.id, 0)).toThrow(
        new ValidationException('Price must be greater than zero.'),
      );

      expect(() => AddPriceToIngredient.of(saved.id, -1.5)).toThrow(
        new ValidationException('Price must be greater than zero.'),
      );
    });
  });
});
