import { IngredientDto } from '@app/modules/ingredients/dtos/ingredient-dto';
import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';

import { GetIngredientsByPageQuery, GetIngredientsByPageResult } from './get-ingredients-by-page';

export class GetIngredientsByPageResponseDto {
  @ApiProperty({ type: [IngredientDto] })
  items: IngredientDto[];

  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  page: number;

  @ApiProperty({ type: Number })
  limit: number;

  constructor(items: IngredientDto[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}

@ApiTags('Ingredients')
@Controller({ path: 'ingredients', version: '1' })
export class GetIngredientsByPageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of ingredients',
    description: 'Retrieves a paginated list of ingredients.',
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10 })
  @ApiOkResponse({
    type: GetIngredientsByPageResponseDto,
    description: 'Successfully retrieved ingredients',
  })
  async getIngredients(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<GetIngredientsByPageResponseDto> {
    const query = GetIngredientsByPageQuery.of(parseInt(page, 10), parseInt(limit, 10));
    const result = await this.queryBus.execute<GetIngredientsByPageQuery, GetIngredientsByPageResult>(query);

    return new GetIngredientsByPageResponseDto(result.items, result.total, result.page, result.limit);
  }
}
