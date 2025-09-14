import { Recipe } from '@app/modules/recipes/entities/recipe.entity';
import { faker } from '@faker-js/faker';

export class FakeRecipe {
  static generate(overrides: Partial<Recipe> = {}): Recipe {
    const recipe = new Recipe(
      overrides.name ?? faker.commerce.productName(),
      overrides.description ?? faker.commerce.productDescription(),
    );

    recipe.id = overrides.id ?? faker.string.uuid();
    recipe.createdAt = overrides.createdAt ?? faker.date.past();
    recipe.createdBy = overrides.createdBy ?? faker.string.uuid();
    recipe.lastModifiedAt = overrides.lastModifiedAt;
    recipe.lastModifiedBy = overrides.lastModifiedBy;
    recipe.version = overrides.version ?? 0;
    recipe.deletedAt = overrides.deletedAt;

    if (overrides.ingredients) {
      recipe.ingredients = overrides.ingredients;
    }

    return recipe;
  }

  static withRandomIngredients(overrides: Partial<Recipe> = {}, count = 3): Recipe {
    const recipe = this.generate(overrides);

    for (let i = 0; i < count; i++) {
      recipe.addIngredient(faker.string.uuid(), parseFloat(faker.number.float({ min: 0.1, max: 5 }).toFixed(2)));
    }

    return recipe;
  }

  static withIngredients(
    ingredients: { ingredientId: string; quantity: number }[],
    overrides: Partial<Recipe> = {},
  ): Recipe {
    const recipe = this.generate(overrides);

    for (const { ingredientId, quantity } of ingredients) {
      recipe.addIngredient(ingredientId, quantity);
    }

    return recipe;
  }
}
