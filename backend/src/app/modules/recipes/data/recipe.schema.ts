import { EntitySchema } from 'typeorm';

import { Recipe } from '../entities/recipe.entity';

export const RecipeSchema = new EntitySchema<Recipe>({
  name: 'Recipe',
  tableName: 'recipes',
  target: Recipe,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
    },
    name: {
      type: String,
      length: 255,
      nullable: false,
    },
    description: {
      type: String,
      length: 10000,
      nullable: true,
    },

    // Audit fields
    createdAt: {
      type: Date,
      createDate: true,
      nullable: false,
      name: 'created_at',
    },
    createdBy: {
      type: 'uuid',
      nullable: false,
      name: 'created_by',
    },
    lastModifiedAt: {
      type: Date,
      updateDate: true,
      nullable: true,
      name: 'last_modified_at',
    },
    lastModifiedBy: {
      type: 'uuid',
      nullable: true,
      name: 'last_modified_by',
    },

    // Optimistic Concurrency
    version: {
      type: 'integer',
      nullable: false,
      default: 1,
      version: true,
    },

    // Soft Delete
    deletedAt: {
      type: Date,
      nullable: true,
      name: 'deleted_at',
      deleteDate: true,
    },
  },
  relations: {
    ingredients: {
      type: 'one-to-many',
      target: 'RecipeIngredient',
      inverseSide: 'recipe',
      cascade: true,
      eager: true,
    },
  },
});
