import { CreateRecipeRequestDto } from '@app/modules/recipes/features/creating-recipe/create-recipe.controller';
import { faker } from '@faker-js/faker';

export class FakeCreateRecipeRequestDto {
  static generate(overrides: Partial<CreateRecipeRequestDto> = {}): CreateRecipeRequestDto {
    return {
      name: overrides.name ?? faker.commerce.productName(),
      description: overrides.description ?? faker.commerce.productDescription(),
      ingredients: overrides.ingredients ?? [
        {
          ingredientId: faker.string.uuid(),
          quantity: parseFloat(faker.number.float({ min: 0.01, max: 5 }).toFixed(2)),
        },
        {
          ingredientId: faker.string.uuid(),
          quantity: parseFloat(faker.number.float({ min: 0.01, max: 5 }).toFixed(2)),
        },
      ],
    };
  }
}
