import { IngredientDto } from '@app/modules/ingredients/dtos/ingredient-dto';

import { Ingredient } from './entities/ingredient.entity';

export class IngredientsMapper {
  static ingredientToIngredientDto(ingredient: Ingredient): IngredientDto {
    return new IngredientDto(
      ingredient.id,
      ingredient.name,
      ingredient.supplier,
      ingredient.createdAt,
      ingredient.version,
      ingredient.lastModifiedAt,
    );
  }

  static ingredientDtoToIngredient(dto: Partial<IngredientDto>, existing?: Ingredient): Ingredient {
    const ingredient = existing ?? new Ingredient('', '');
    if (dto.name) ingredient.name = dto.name;
    if (dto.supplier) ingredient.supplier = dto.supplier;
    return ingredient;
  }
}
