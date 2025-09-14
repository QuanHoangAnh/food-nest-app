import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { RecipeIngredientDto } from '@app/modules/recipes/dto/recipe-ingredient-dto';
import { CalculateRecipeCostService } from '@app/modules/recipes/services/calculate-recipe-cost.service';
import { Guard } from '@libs/core/validations/guard';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RecipeWithCostDto } from '../../dto/recipe-with-cost-dto';
import { RecipesMapper } from '../../recipes.mapper';
import { RECIPE_REPOSITORY_TOKEN } from '../../recipes.tokens';

export class GetRecipeByIdWithCostQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly bypassCache?: boolean,
  ) {}

  static of(id: string | undefined, bypassCache = false): GetRecipeByIdWithCostQuery {
    const validatedId = Guard.notNullOrWhiteSpace(id, 'id', 'Recipe ID is required.');
    return new GetRecipeByIdWithCostQuery(validatedId.trim(), bypassCache);
  }
}

export class GetRecipeByIdWithCostResult {
  constructor(public readonly recipeWithCost: RecipeWithCostDto) {}
}

@QueryHandler(GetRecipeByIdWithCostQuery)
export class GetRecipeByIdWithCostHandler
  implements IQueryHandler<GetRecipeByIdWithCostQuery, GetRecipeByIdWithCostResult>
{
  private readonly logger = new Logger(GetRecipeByIdWithCostHandler.name);

  constructor(
    @Inject(RECIPE_REPOSITORY_TOKEN)
    private readonly repository: IRecipeRepository,
    private readonly costCalculator: CalculateRecipeCostService,
  ) {}

  async execute(query: GetRecipeByIdWithCostQuery): Promise<GetRecipeByIdWithCostResult> {
    const { id, bypassCache } = query;

    const recipe = await this.repository.findById(id);
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID '${id}' not found.`);
    }

    const { ingredients: ingredientDtos, totalCost } = await this.costCalculator.calculate(recipe, !bypassCache);

    const recipeDto = RecipesMapper.recipeToRecipeDto(recipe);
    const recipeWithCost = new RecipeWithCostDto(
      recipeDto,
      ingredientDtos.map(
        x => new RecipeIngredientDto(x.ingredientId, x.ingredientName, x.quantity, x.unitPrice, x.lineCost),
      ),
    );

    this.logger.log(
      `Fetched recipe ${recipe.id} with cost $${totalCost.toFixed(2)} (cache: ${bypassCache ? 'bypassed' : 'used'})`,
    );

    return new GetRecipeByIdWithCostResult(recipeWithCost);
  }
}
