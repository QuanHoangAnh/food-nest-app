import { Ingredient } from '@app/modules/ingredients/entities/ingredient.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(
  Ingredient,
  () =>
    // We'll pass real data from seeder — factory just returns it
    // This is a "passthrough" factory for structured CSV data
    ({}) as Ingredient,
);
