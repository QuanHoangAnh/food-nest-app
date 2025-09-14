import { Ingredient } from '@app/modules/ingredients/entities/ingredient.entity';
import { faker } from '@faker-js/faker';

export class FakeIngredient {
  static generate(overrides: Partial<Ingredient> = {}): Ingredient {
    const ingredient = new Ingredient(
      overrides.name ?? faker.commerce.productName(),
      overrides.supplier ?? faker.company.name(),
    );

    ingredient.id = overrides.id ?? faker.string.uuid();
    ingredient.createdAt = overrides.createdAt ?? faker.date.past();
    ingredient.createdBy = overrides.createdBy ?? faker.string.uuid();
    ingredient.lastModifiedAt = overrides.lastModifiedAt;
    ingredient.lastModifiedBy = overrides.lastModifiedBy;
    ingredient.version = overrides.version ?? 0;
    ingredient.deletedAt = overrides.deletedAt;

    if (overrides.priceHistory) {
      ingredient.priceHistory = overrides.priceHistory;
    }

    return ingredient;
  }

  static withRandomPrices(overrides: Partial<Ingredient> = {}, count = 3): Ingredient {
    const ingredient = this.generate(overrides);

    for (let i = 0; i < count; i++) {
      ingredient.addPrice(
        parseFloat(faker.commerce.price({ min: 0.5, max: 50, dec: 2 })),
        faker.date.past({ years: 1 }),
      );
    }

    return ingredient;
  }

  static withPrices(prices: { price: number; date?: Date }[], overrides: Partial<Ingredient> = {}): Ingredient {
    const ingredient = this.generate(overrides);

    for (const { price, date = new Date() } of prices) {
      ingredient.addPrice(price, date);
    }

    return ingredient;
  }
}
