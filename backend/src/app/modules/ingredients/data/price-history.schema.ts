import { EntitySchema } from 'typeorm';

import { PriceHistory } from '../entities/price-history.entity';

export const PriceHistorySchema = new EntitySchema<PriceHistory>({
  name: 'PriceHistory',
  tableName: 'price_history',
  target: PriceHistory,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
    },
    price: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    changedAt: {
      type: Date,
      nullable: false,
      name: 'changed_at',
    },
    ingredientId: {
      type: 'uuid',
      nullable: false,
      name: 'ingredient_id',
    },
  },
  relations: {
    ingredient: {
      type: 'many-to-one',
      target: 'Ingredient',
      joinColumn: {
        name: 'ingredient_id',
        referencedColumnName: 'id',
      },
    },
  },
});
