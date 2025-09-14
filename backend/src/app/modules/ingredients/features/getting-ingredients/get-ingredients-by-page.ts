import type { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { IngredientDto } from '@app/modules/ingredients/dtos/ingredient-dto';
import { guard } from '@libs/core/validations/guard';
import { Inject, Logger } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { IngredientsMapper } from '../../ingredients.mapper';
import { INGREDIENT_REPOSITORY_TOKEN } from '../../ingredients.tokens';

export class GetIngredientsByPageQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
  ) {}

  static of(page?: number, limit?: number): GetIngredientsByPageQuery {
    guard.notNegativeOrZero(page, 'page', 'Page must be >= 1');
    guard.notNegativeOrZero(limit, 'limit', 'Limit must be >= 1');

    return new GetIngredientsByPageQuery(page!, limit!);
  }
}

export class GetIngredientsByPageResult {
  constructor(
    public readonly items: IngredientDto[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}

@QueryHandler(GetIngredientsByPageQuery)
export class GetIngredientsByPageHandler
  implements IQueryHandler<GetIngredientsByPageQuery, GetIngredientsByPageResult>
{
  private readonly logger = new Logger(GetIngredientsByPageHandler.name);

  constructor(
    @Inject(INGREDIENT_REPOSITORY_TOKEN)
    private readonly repository: IIngredientRepository,
  ) {}

  async execute(query: GetIngredientsByPageQuery): Promise<GetIngredientsByPageResult> {
    const { page, limit } = query;

    const { items, total } = await this.repository.findAll(page, limit);

    const dtos = items.map(x => IngredientsMapper.ingredientToIngredientDto(x));

    this.logger.log(`Fetched ${dtos.length} ingredients (page ${page}, total ${total})`);

    return new GetIngredientsByPageResult(dtos, total, page, limit);
  }
}
