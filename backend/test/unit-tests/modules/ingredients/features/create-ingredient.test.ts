import type { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import {
  CreateIngredient,
  CreateIngredientHandler,
  CreateIngredientResult,
} from '@app/modules/ingredients/features/creating-ingredient/create-ingredient';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { faker } from '@faker-js/faker';
import { Arg, Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeIngredient } from '../../../../shared/fakes/fake-ingredient';

describe('CreateIngredientHandler', (): void => {
  let handler: CreateIngredientHandler;
  let repository: SubstituteOf<IIngredientRepository>;

  beforeEach(async () => {
    repository = Substitute.for<IIngredientRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateIngredientHandler,
        {
          provide: INGREDIENT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<CreateIngredientHandler>(CreateIngredientHandler);
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  describe('Given valid ingredient data', () => {
    it('should create ingredient successfully and return result', async () => {
      // Arrange
      const name = faker.commerce.productName();
      const supplier = faker.company.name();
      const command = CreateIngredient.of(name, supplier, undefined); // No prices

      const fakeIngredient = FakeIngredient.generate({
        name,
        supplier,
      });

      // Simulate ingredient doesn't exist before
      repository.findByName(name).returns(Promise.resolve(null));
      repository
        .save(Arg.is((i: any) => i.name === name && i.supplier === supplier))
        .returns(Promise.resolve(fakeIngredient));

      // Act
      const result = await handler.execute(command);

      // Assert
      repository.received(1).findByName(name);
      repository.received(1).save(Arg.is((i: any) => i.name === name && i.supplier === supplier));

      expect(result).toBeInstanceOf(CreateIngredientResult);
      expect(result.id).toBe(fakeIngredient.id);
      expect(result.name).toBe(name);
      expect(result.supplier).toBe(supplier);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Given ingredient with initial prices', () => {
    it('should create ingredient and save all price entries', async () => {
      // Arrange
      const name = faker.commerce.productName();
      const supplier = faker.company.name();
      const prices = [
        { price: 1.5, changedAt: '2024-01-01T00:00:00Z' },
        { price: 1.8, changedAt: '2024-06-01T00:00:00Z' },
      ];
      const command = CreateIngredient.of(name, supplier, prices);

      const fakeIngredient = FakeIngredient.generate({
        name,
        supplier,
      });

      // Simulate no duplicate
      repository.findByName(name).returns(Promise.resolve(null));

      // When saving, verify that ingredients have correct number of prices
      repository
        .save(
          Arg.is(
            (i: any) =>
              i.name === name &&
              i.supplier === supplier &&
              i.priceHistory?.length === 2 &&
              i.priceHistory[0].price === 1.5 &&
              i.priceHistory[1].price === 1.8,
          ),
        )
        .returns(Promise.resolve(fakeIngredient));

      // Act
      const result = await handler.execute(command);

      // Assert
      repository.received(1).findByName(name);
      repository.received(1).save(Arg.is((i: any) => i.priceHistory?.length === 2));

      expect(result).toBeInstanceOf(CreateIngredientResult);
      expect(result.id).toBe(fakeIngredient.id);
      expect(result.name).toBe(name);
      expect(result.supplier).toBe(supplier);
    });
  });

  describe('Given repository.save throws an error', () => {
    it('should propagate the error', async () => {
      // Arrange
      const name = faker.commerce.productName();
      const supplier = faker.company.name();
      const command = CreateIngredient.of(name, supplier, undefined);

      repository.findByName(name).returns(Promise.resolve(null));
      repository.save(Arg.any()).throws(new Error('Database connection failed'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Given invalid name', () => {
    it('should throw validation error when name is null or whitespace', () => {
      // Act & Assert
      expect(() => CreateIngredient.of('', 'supplier')).toThrow(
        new ValidationException('Ingredient name is required.'),
      );
      expect(() => CreateIngredient.of(null as any, 'supplier')).toThrow(
        new ValidationException('Ingredient name is required.'),
      );
      expect(() => CreateIngredient.of('   ', 'supplier')).toThrow(
        new ValidationException('Ingredient name is required.'),
      );
    });
  });

  describe('Given invalid supplier', () => {
    it('should throw validation error when supplier is null or whitespace', () => {
      // Act & Assert
      expect(() => CreateIngredient.of('Flour', '')).toThrow(new ValidationException('Supplier is required.'));
      expect(() => CreateIngredient.of('Flour', null as any)).toThrow(new ValidationException('Supplier is required.'));
      expect(() => CreateIngredient.of('Flour', '   ')).toThrow(new ValidationException('Supplier is required.'));
    });
  });

  describe('Given invalid price data', () => {
    it('should throw validation error if price is zero', () => {
      const prices = [{ price: 0 }];
      expect(() => CreateIngredient.of('Flour', 'Bobs Mill', prices)).toThrow(
        new ValidationException('Price must be greater than zero.'),
      );
    });

    it('should throw validation error if price is negative', () => {
      const prices = [{ price: -1.5 }];
      expect(() => CreateIngredient.of('Flour', 'Bobs Mill', prices)).toThrow(
        new ValidationException('Price must be greater than zero.'),
      );
    });

    it('should throw validation error if price is -0.01', () => {
      const prices = [{ price: -0.01 }];
      expect(() => CreateIngredient.of('Flour', 'Bobs Mill', prices)).toThrow(
        new ValidationException('Price must be greater than zero.'),
      );
    });
  });

  describe('Given invalid date format in price', () => {
    it('should throw error if changedAt is invalid', () => {
      const prices = [{ price: 2.5, changedAt: 'not-a-date' }];
      expect(() => CreateIngredient.of('Flour', 'Bobs Mill', prices)).toThrow(
        'Invalid date format for changedAt: not-a-date',
      );
    });
  });

  describe('Given empty prices array', () => {
    it('should allow empty prices array', () => {
      // Should not throw — empty array is valid
      const prices: { price: number; changedAt?: string }[] = [];
      const command = CreateIngredient.of('Flour', 'Bobs Mill', prices);

      // Should not throw
      expect(() => command).not.toThrow();
    });
  });
});
