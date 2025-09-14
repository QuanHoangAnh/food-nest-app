import { AddPriceToIngredientHandler } from '@app/modules/ingredients/features/adding-price-to-ingredient/add-price-to-ingredient';
import { AddPriceToIngredientController } from '@app/modules/ingredients/features/adding-price-to-ingredient/add-price-to-ingredient.controller';
import { CreateIngredientHandler } from '@app/modules/ingredients/features/creating-ingredient/create-ingredient';
import { CreateIngredientController } from '@app/modules/ingredients/features/creating-ingredient/create-ingredient.controller';
import { GetIngredientsByPageHandler } from '@app/modules/ingredients/features/getting-ingredients/get-ingredients-by-page';
import { GetIngredientsByPageController } from '@app/modules/ingredients/features/getting-ingredients/get-ingredients-by-page.controller';
import { PostgresTypeormModule } from '@libs/postgres-typeorm/postgres-typeorm.module';
import { Module } from '@nestjs/common';

import { IngredientRepository } from './data/ingredient.repository';
import { IngredientSchema } from './data/ingredient.schema';
import { PriceHistorySchema } from './data/price-history.schema';
import { GetIngredientByIdHandler } from './features/getting-ingredient-by-id/get-ingredient-by-id';
import { GetIngredientByIdController } from './features/getting-ingredient-by-id/get-ingredient-by-id.controller';
import { GetLatestIngredientPriceHandler } from './features/getting-latest-ingredient-price/get-latest-ingredient-price';
import { GetLatestIngredientPriceController } from './features/getting-latest-ingredient-price/get-latest-ingredient-price.controller';
import { ImportIngredientsFromCsvHandler } from './features/importing-ingredients/import-ingredients-from-csv';
import { ImportIngredientsFromCsvController } from './features/importing-ingredients/import-ingredients-from-csv.controller';
import { ImportPriceChangesFromJson } from './features/importing-price-changes/import-price-changes-from-json';
import { ImportPriceChangesFromJsonController } from './features/importing-price-changes/import-price-changes-from-json.controller';
import { INGREDIENT_REPOSITORY_TOKEN } from './ingredients.tokens';

const Handlers = [
  GetIngredientByIdHandler,
  GetLatestIngredientPriceHandler,
  ImportIngredientsFromCsvHandler,
  ImportPriceChangesFromJson,
  GetIngredientsByPageHandler,
  AddPriceToIngredientHandler,
  CreateIngredientHandler,
];
const Controllers = [
  GetIngredientByIdController,
  GetLatestIngredientPriceController,
  ImportIngredientsFromCsvController,
  ImportPriceChangesFromJsonController,
  GetIngredientsByPageController,
  CreateIngredientController,
  AddPriceToIngredientController,
];

@Module({
  providers: [
    {
      provide: INGREDIENT_REPOSITORY_TOKEN,
      useClass: IngredientRepository,
    },
    ...Handlers,
  ],
  controllers: [...Controllers],
  imports: [PostgresTypeormModule.forFeature([IngredientSchema, PriceHistorySchema])],
  exports: [
    INGREDIENT_REPOSITORY_TOKEN, // This makes it injectable to use by the receipt module
  ],
})
export class IngredientsModule {}
