import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam, ApiPropertyOptional, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UpdateRecipe, UpdateRecipeResult } from './update-recipe';

export class UpdateRecipeRequestDto {
  @ApiPropertyOptional({
    description: 'New name for the recipe',
    example: 'Extra Spicy Szechuan Noodles',
    minLength: 1,
    maxLength: 255,
  })
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'New description for the recipe',
    example: 'Now with 2x the chili heat!',
    nullable: true,
  })
  readonly description?: string | null;
}

export class UpdateRecipeResponseDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly lastModifiedAt?: Date,
    public readonly description?: string | null,
  ) {}
}

@ApiTags('Recipes')
@Controller({ path: 'recipes', version: '1' })
export class UpdateRecipeController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update recipe', description: 'Updates a recipe by ID' })
  @ApiParam({
    name: 'id',
    description: 'Unique recipe ID',
    example: 'rec_abc123',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recipe updated successfully',
    type: UpdateRecipeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Recipe not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Version conflict (optimistic concurrency)' })
  async update(@Param('id') id: string, @Body() dto: UpdateRecipeRequestDto): Promise<UpdateRecipeResponseDto> {
    const command = UpdateRecipe.of(id, dto.name, dto.description);
    const result = await this.commandBus.execute<UpdateRecipe, UpdateRecipeResult>(command);

    return new UpdateRecipeResponseDto(result.id, result.name, result.lastModifiedAt, result.description);
  }
}
