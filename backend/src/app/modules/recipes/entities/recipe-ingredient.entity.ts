import { Recipe } from '@app/modules/recipes/entities/recipe.entity';
import { Entity } from '@libs/core/entity/entity';

export class RecipeIngredient extends Entity<string> {
  quantity: number;
  recipeId: string;
  ingredientId: string;
  recipe?: Recipe;

  constructor(quantity: number, recipeId: string, ingredientId: string) {
    super();
    this.quantity = quantity;
    this.recipeId = recipeId;
    this.ingredientId = ingredientId;
  }
}
