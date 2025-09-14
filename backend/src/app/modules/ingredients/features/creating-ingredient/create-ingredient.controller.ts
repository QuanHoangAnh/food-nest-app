import {
  CreateIngredientRequestDto,
  CreateIngredientResponseDto,
} from '@app/modules/ingredients/features/creating-ingredient/create-ingredient.dto';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateIngredient, CreateIngredientResult } from './create-ingredient';

@ApiTags('Ingredients')
@Controller({ path: 'ingredients', version: '1' })
export class CreateIngredientController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create ingredient', description: 'Creates a new ingredient' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ingredient created successfully',
    type: CreateIngredientResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Ingredient name already exists' })
  async create(@Body() dto: CreateIngredientRequestDto): Promise<CreateIngredientResponseDto> {
    const command = CreateIngredient.of(dto.name, dto.supplier);
    const result = await this.commandBus.execute<CreateIngredient, CreateIngredientResult>(command);

    return new CreateIngredientResponseDto(result.id);
  }
}
