import { EntitySchema } from 'typeorm';

import { RecipeIngredient } from '../entities/recipe-ingredient.entity';

export const RecipeIngredientSchema = new EntitySchema<RecipeIngredient>({
  name: 'RecipeIngredient',
  tableName: 'recipe_ingredients',
  target: RecipeIngredient,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
    },
    quantity: {
      type: 'decimal',
      precision: 10,
      scale: 4,
      nullable: false,
    },
    recipeId: {
      type: 'uuid',
      nullable: false,
      name: 'recipe_id',
    },
    ingredientId: {
      type: 'uuid',
      nullable: false,
      name: 'ingredient_id',
    },
  },
  relations: {
    recipe: {
      type: 'many-to-one',
      target: 'Recipe',
      joinColumn: { name: 'recipe_id' },
    },
  },
});
