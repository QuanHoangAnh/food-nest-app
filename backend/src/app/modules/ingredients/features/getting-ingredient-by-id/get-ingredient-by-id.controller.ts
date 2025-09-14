import { IngredientDto } from '@app/modules/ingredients/dtos/ingredient-dto';
import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { GetIngredientByIdQuery, GetIngredientByIdResult } from './get-ingredient-by-id';

export class GetIngredientByIdResponseDto {
  constructor(public readonly ingredient: IngredientDto) {}
}

@ApiTags('Ingredients')
@Controller({ path: 'ingredients', version: '1' })
export class GetIngredientByIdController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get ingredient by ID',
    description: 'Retrieves a single ingredient by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique ingredient ID',
    example: 'ingr_abc123',
    type: String,
  })
  @ApiOkResponse({
    type: GetIngredientByIdResponseDto,
    description: 'Successfully retrieved ingredient',
  })
  @ApiNotFoundResponse({ description: 'Ingredient not found' })
  async getIngredientById(@Param('id') id: string): Promise<GetIngredientByIdResponseDto> {
    const query = GetIngredientByIdQuery.of(id);
    const result = await this.queryBus.execute<GetIngredientByIdQuery, GetIngredientByIdResult>(query);

    return new GetIngredientByIdResponseDto(result.ingredient);
  }
}
