import type { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { IngredientDto } from '@app/modules/ingredients/dtos/ingredient-dto';
import { IngredientsMapper } from '@app/modules/ingredients/ingredients.mapper';
import { Guard } from '@libs/core/validations/guard';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { INGREDIENT_REPOSITORY_TOKEN } from '../../ingredients.tokens';

export class GetIngredientByIdQuery implements IQuery {
  constructor(public readonly id: string) {}

  static of(id: string | undefined): GetIngredientByIdQuery {
    const validatedId = Guard.notNullOrWhiteSpace(id, 'id', 'Ingredient ID is required.');
    return new GetIngredientByIdQuery(validatedId.trim());
  }
}

export class GetIngredientByIdResult {
  constructor(public readonly ingredient: IngredientDto) {}
}

@QueryHandler(GetIngredientByIdQuery)
export class GetIngredientByIdHandler implements IQueryHandler<GetIngredientByIdQuery, GetIngredientByIdResult> {
  private readonly logger = new Logger(GetIngredientByIdHandler.name);

  constructor(
    @Inject(INGREDIENT_REPOSITORY_TOKEN)
    private readonly repository: IIngredientRepository,
  ) {}

  async execute(query: GetIngredientByIdQuery): Promise<GetIngredientByIdResult> {
    const { id } = query;

    const ingredient = await this.repository.findById(id);

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID '${id}' not found.`);
    }

    this.logger.log(`Fetched ingredient ${ingredient.id} - ${ingredient.name}`);

    return new GetIngredientByIdResult(IngredientsMapper.ingredientToIngredientDto(ingredient));
  }
}
