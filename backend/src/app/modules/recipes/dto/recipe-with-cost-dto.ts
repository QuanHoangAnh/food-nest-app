import { ApiProperty } from '@nestjs/swagger';

import { RecipeDto } from './recipe-dto';
import { RecipeIngredientDto } from './recipe-ingredient-dto';

export class RecipeWithCostDto {
  @ApiProperty({ type: () => RecipeDto })
  recipe: RecipeDto;

  @ApiProperty({
    type: [RecipeIngredientDto],
    description: 'List of ingredients with cost breakdown',
  })
  ingredients: RecipeIngredientDto[];

  @ApiProperty({
    description: 'Total cost to produce this recipe',
    example: 8.75,
    minimum: 0,
  })
  totalCost: number;

  constructor(recipe: RecipeDto, ingredients: RecipeIngredientDto[]) {
    this.recipe = recipe;
    this.ingredients = ingredients;
    this.totalCost = ingredients.reduce((sum, item) => sum + item.total, 0);
  }
}
