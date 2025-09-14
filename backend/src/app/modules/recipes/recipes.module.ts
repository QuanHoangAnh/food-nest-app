import { IngredientsModule } from '@app/modules/ingredients/ingredients.module';
import { RecipeSchema } from '@app/modules/recipes/data/recipe.schema';
import { RecipeIngredientSchema } from '@app/modules/recipes/data/recipe-ingredient.schema';
import { DeleteRecipeHandler } from '@app/modules/recipes/features/deleting-recipe/delete-recipe';
import { DeleteRecipeController } from '@app/modules/recipes/features/deleting-recipe/delete-recipe.controller';
import { UpdateRecipeHandler } from '@app/modules/recipes/features/updating-recipe/update-recipe';
import { UpdateRecipeController } from '@app/modules/recipes/features/updating-recipe/update-recipe.controller';
import { CalculateRecipeCostService } from '@app/modules/recipes/services/calculate-recipe-cost.service';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipeRepository } from './data/recipe.repository';
import { CreateRecipeHandler } from './features/creating-recipe/create-recipe';
import { CreateRecipeController } from './features/creating-recipe/create-recipe.controller';
import { GetRecipeByIdWithCostHandler } from './features/getting-recipe-by-id-with-cost/get-recipe-by-id-with-cost';
import { GetRecipeByIdWithCostController } from './features/getting-recipe-by-id-with-cost/get-recipe-by-id-with-cost.controller';
import { GetRecipesByPageHandler } from './features/getting-recipes/get-recipes-by-page';
import { GetRecipesByPageController } from './features/getting-recipes/get-recipes-by-page.controller';
import { RECIPE_REPOSITORY_TOKEN } from './recipes.tokens';

const Handlers = [
  CreateRecipeHandler,
  GetRecipeByIdWithCostHandler,
  GetRecipesByPageHandler,
  UpdateRecipeHandler,
  DeleteRecipeHandler,
];
const Controllers = [
  CreateRecipeController,
  GetRecipeByIdWithCostController,
  GetRecipesByPageController,
  UpdateRecipeController,
  DeleteRecipeController,
];

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([RecipeSchema, RecipeIngredientSchema]),
    IngredientsModule,
  ],
  providers: [
    CalculateRecipeCostService,
    {
      provide: RECIPE_REPOSITORY_TOKEN,
      useClass: RecipeRepository,
    },
    ...Handlers,
  ],
  controllers: [...Controllers],
})
export class RecipesModule {}
