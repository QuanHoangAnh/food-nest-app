import { PriceHistory } from '@app/modules/ingredients/entities/price-history.entity';
import { AuditableSoftDeleteEntity } from '@libs/core/entity/auditable-entity';

export class Ingredient extends AuditableSoftDeleteEntity<string> {
  name: string;
  supplier: string;
  priceHistory: PriceHistory[];

  constructor(name: string, supplier: string) {
    super();
    this.name = name;
    this.supplier = supplier;
  }

  addPrice(price: number, date: Date): void {
    if (!this.priceHistory) {
      this.priceHistory = [];
    }
    this.priceHistory.push(new PriceHistory(price, date, this.id));
  }
}
