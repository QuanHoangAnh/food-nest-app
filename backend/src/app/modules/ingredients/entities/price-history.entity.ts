import { Ingredient } from '@app/modules/ingredients/entities/ingredient.entity';
import { Entity } from '@libs/core/entity/entity';

export class PriceHistory extends Entity<string> {
  price: number;
  changedAt: Date;
  ingredientId: string;
  ingredient?: Ingredient;

  constructor(price: number, changedAt: Date, ingredientId: string) {
    super();
    this.price = price;
    this.changedAt = changedAt;
    this.ingredientId = ingredientId;
  }
}
