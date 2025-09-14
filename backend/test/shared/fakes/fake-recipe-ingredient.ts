import { RecipeIngredient } from '@app/modules/recipes/entities/recipe-ingredient.entity';
import { faker } from '@faker-js/faker';

export class FakeRecipeIngredient {
  static generate(overrides: Partial<RecipeIngredient> = {}): RecipeIngredient {
    return {
      id: overrides.id ?? '',
      quantity: overrides.quantity ?? parseFloat(faker.commerce.price({ min: 0.01, max: 5, dec: 4 })),
      recipeId: overrides.recipeId ?? faker.string.uuid(),
      ingredientId: overrides.ingredientId ?? faker.string.uuid(),
    };
  }
}
