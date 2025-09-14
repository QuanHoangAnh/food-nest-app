import { HealthModule } from '@app/modules/health/health.module';
import { IngredientsModule } from '@app/modules/ingredients/ingredients.module';
import { RecipesModule } from '@app/modules/recipes/recipes.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    // shared global modules
    SharedModule,

    // feature modules
    IngredientsModule,
    RecipesModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
