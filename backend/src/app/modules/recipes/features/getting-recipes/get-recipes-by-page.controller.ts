import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';

import { RecipeDto } from '../../dto/recipe-dto';
import { GetRecipesByPageQuery, GetRecipesByPageResult } from './get-recipes-by-page';

export class GetRecipesByPageResponseDto {
  @ApiProperty({ type: [RecipeDto] })
  items: RecipeDto[];

  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  page: number;

  @ApiProperty({ type: Number })
  limit: number;

  constructor(items: RecipeDto[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}

@ApiTags('Recipes')
@Controller({ path: 'recipes', version: '1' })
export class GetRecipesByPageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of recipes',
    description: 'Retrieves a paginated list of recipes.',
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10 })
  @ApiOkResponse({
    type: GetRecipesByPageResponseDto,
    description: 'Successfully retrieved recipes',
  })
  async getRecipes(@Query('page') page: string, @Query('limit') limit: string): Promise<GetRecipesByPageResponseDto> {
    const query = GetRecipesByPageQuery.of(parseInt(page, 10), parseInt(limit, 10));
    const result = await this.queryBus.execute<GetRecipesByPageQuery, GetRecipesByPageResult>(query);

    return new GetRecipesByPageResponseDto(result.items, result.total, result.page, result.limit);
  }
}
