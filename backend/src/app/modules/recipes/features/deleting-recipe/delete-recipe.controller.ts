import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DeleteRecipe, DeleteRecipeResult } from './delete-recipe';

export class DeleteRecipeResponseDto {
  constructor(public readonly id: string) {}
}

@ApiTags('Recipes')
@Controller({ path: 'recipes', version: '1' })
export class DeleteRecipeController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete recipe', description: 'Soft-deletes a recipe by ID' })
  @ApiParam({
    name: 'id',
    description: 'Unique recipe ID',
    example: 'rec_abc123',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recipe soft-deleted successfully',
    type: DeleteRecipeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Recipe not found' })
  async delete(@Param('id') id: string): Promise<DeleteRecipeResponseDto> {
    const command = DeleteRecipe.of(id);
    const result = await this.commandBus.execute<DeleteRecipe, DeleteRecipeResult>(command);

    return new DeleteRecipeResponseDto(result.id);
  }
}
