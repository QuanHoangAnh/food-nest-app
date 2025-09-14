import { EntitySchema } from 'typeorm';

import { Ingredient } from '../entities/ingredient.entity';

export const IngredientSchema = new EntitySchema<Ingredient>({
  name: 'Ingredient',
  tableName: 'ingredients',
  target: Ingredient,
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
      unique: true,
    },
    supplier: {
      type: String,
      length: 255,
      nullable: false,
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
    priceHistory: {
      type: 'one-to-many',
      target: 'PriceHistory',
      inverseSide: 'ingredient',
      cascade: true,
      eager: true,
    },
  },
});
