import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { guard } from '@libs/core/validations/guard';
import { Inject, Logger } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RecipeDto } from '../../dto/recipe-dto';
import { RecipesMapper } from '../../recipes.mapper';
import { RECIPE_REPOSITORY_TOKEN } from '../../recipes.tokens';

export class GetRecipesByPageQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
  ) {}

  static of(page?: number, limit?: number): GetRecipesByPageQuery {
    guard.notNegativeOrZeroNullable(page, 'page', 'Page must be >= 1');
    guard.notNegativeOrZeroNullable(limit, 'limit', 'Limit must be >= 1');

    return new GetRecipesByPageQuery(page!, limit!);
  }
}

export class GetRecipesByPageResult {
  constructor(
    public readonly items: RecipeDto[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}

@QueryHandler(GetRecipesByPageQuery)
export class GetRecipesByPageHandler implements IQueryHandler<GetRecipesByPageQuery, GetRecipesByPageResult> {
  private readonly logger = new Logger(GetRecipesByPageHandler.name);

  constructor(
    @Inject(RECIPE_REPOSITORY_TOKEN)
    private readonly repository: IRecipeRepository,
  ) {}

  async execute(query: GetRecipesByPageQuery): Promise<GetRecipesByPageResult> {
    const { page, limit } = query;

    const { items, total } = await this.repository.findAll(page, limit);

    const dtos = items.map(x => RecipesMapper.recipeToRecipeDto(x));

    this.logger.log(`Fetched ${dtos.length} recipes (page ${page}, total ${total})`);

    return new GetRecipesByPageResult(dtos, total, page, limit);
  }
}
