import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { RecipeWithCostDto } from '../../dto/recipe-with-cost-dto';
import { GetRecipeByIdWithCostQuery, GetRecipeByIdWithCostResult } from './get-recipe-by-id-with-cost';

export class GetRecipeByIdWithCostResponseDto {
  constructor(public readonly recipe: RecipeWithCostDto) {}
}

@ApiTags('Recipes')
@Controller({ path: 'recipes', version: '1' })
export class GetRecipeByIdWithCostController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id/cost')
  @ApiOperation({
    summary: 'Get recipe by ID with current cost',
    description: 'Retrieves a recipe and calculates its current production cost based on latest ingredient prices.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique recipe ID',
    example: 'rec_abc123',
    type: String,
  })
  @ApiOkResponse({
    type: GetRecipeByIdWithCostResponseDto,
    description: 'Successfully retrieved recipe with cost',
  })
  @ApiNotFoundResponse({ description: 'Recipe or ingredient not found' })
  async getRecipeByIdWithCost(@Param('id') id: string): Promise<GetRecipeByIdWithCostResponseDto> {
    const query = GetRecipeByIdWithCostQuery.of(id);
    const result = await this.queryBus.execute<GetRecipeByIdWithCostQuery, GetRecipeByIdWithCostResult>(query);

    return new GetRecipeByIdWithCostResponseDto(result.recipeWithCost);
  }
}
