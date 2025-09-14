import type { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { Guard } from '@libs/core/validations/guard';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { INGREDIENT_REPOSITORY_TOKEN } from '../../ingredients.tokens';

export class GetLatestIngredientPriceQuery implements IQuery {
  constructor(public readonly ingredientId: string) {}

  static of(ingredientId: string | undefined): GetLatestIngredientPriceQuery {
    const validatedId = Guard.notNullOrWhiteSpace(ingredientId, 'ingredientId', 'Ingredient ID is required.');
    return new GetLatestIngredientPriceQuery(validatedId.trim());
  }
}

export class GetLatestIngredientPriceResult {
  constructor(
    public readonly ingredientId: string,
    public readonly latestPrice: number | null,
  ) {}
}

@QueryHandler(GetLatestIngredientPriceQuery)
export class GetLatestIngredientPriceHandler
  implements IQueryHandler<GetLatestIngredientPriceQuery, GetLatestIngredientPriceResult>
{
  private readonly logger = new Logger(GetLatestIngredientPriceHandler.name);

  constructor(
    @Inject(INGREDIENT_REPOSITORY_TOKEN)
    private readonly repository: IIngredientRepository,
  ) {}

  async execute(query: GetLatestIngredientPriceQuery): Promise<GetLatestIngredientPriceResult> {
    const { ingredientId } = query;

    const ingredient = await this.repository.findById(ingredientId);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID '${ingredientId}' not found.`);
    }

    const latestPrice = await this.repository.getLatestPrice(ingredientId);

    this.logger.log(`Fetched latest price for ingredient ${ingredientId}: ${latestPrice}`);

    return new GetLatestIngredientPriceResult(ingredientId, latestPrice);
  }
}
