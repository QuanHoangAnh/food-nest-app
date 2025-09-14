import { PriceHistory } from '@app/modules/ingredients/entities/price-history.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(
  PriceHistory,
  () =>
    // Passthrough — real data provided by seeder
    ({}) as PriceHistory,
);
