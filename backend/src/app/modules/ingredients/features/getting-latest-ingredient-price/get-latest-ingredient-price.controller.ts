import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { GetLatestIngredientPriceQuery, GetLatestIngredientPriceResult } from './get-latest-ingredient-price';

export class GetLatestIngredientPriceResponseDto {
  constructor(
    public readonly ingredientId: string,
    public readonly latestPrice: number | null,
  ) {}
}

@ApiTags('Ingredients')
@Controller({ path: 'ingredients', version: '1' })
export class GetLatestIngredientPriceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id/latest-price')
  @ApiOperation({
    summary: 'Get latest price for ingredient',
    description: 'Retrieves the most recent price for a given ingredient.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique ingredient ID',
    example: 'ingr_abc123',
    type: String,
  })
  @ApiOkResponse({
    type: GetLatestIngredientPriceResponseDto,
    description: 'Successfully retrieved latest price',
  })
  @ApiNotFoundResponse({ description: 'Ingredient not found' })
  async getLatestPrice(@Param('id') id: string): Promise<GetLatestIngredientPriceResponseDto> {
    const query = GetLatestIngredientPriceQuery.of(id);
    const result = await this.queryBus.execute<GetLatestIngredientPriceQuery, GetLatestIngredientPriceResult>(query);

    return new GetLatestIngredientPriceResponseDto(result.ingredientId, result.latestPrice);
  }
}
