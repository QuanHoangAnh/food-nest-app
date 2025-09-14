import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AddPriceToIngredient, AddPriceToIngredientResult } from './add-price-to-ingredient';
import { AddPriceToIngredientRequestDto, AddPriceToIngredientResponseDto } from './add-price-to-ingredient.dto';

@ApiTags('Ingredients')
@Controller({ path: 'ingredients', version: '1' })
export class AddPriceToIngredientController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':id/price')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add price to ingredient', description: 'Adds a new price entry to an ingredient' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Price added successfully',
    type: AddPriceToIngredientResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ingredient not found' })
  async addPrice(
    @Param('id') ingredientId: string,
    @Body() dto: AddPriceToIngredientRequestDto,
  ): Promise<AddPriceToIngredientResponseDto> {
    const command = AddPriceToIngredient.of(ingredientId, dto.price);
    const result = await this.commandBus.execute<AddPriceToIngredient, AddPriceToIngredientResult>(command);

    return new AddPriceToIngredientResponseDto(result.ingredientId, result.price, result.changedAt);
  }
}
