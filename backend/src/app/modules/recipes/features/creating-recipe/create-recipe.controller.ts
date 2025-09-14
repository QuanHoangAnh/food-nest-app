import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateRecipe, CreateRecipeResult } from './create-recipe';

class RecipeIngredientRequestDto {
  @ApiProperty({
    description: 'ID of the ingredient',
    example: 'ingr_550e8400-e29b-41d4-a716-446655440000',
  })
  ingredientId: string;

  @ApiProperty({
    description: 'Quantity to use (e.g., 0.05 for 50g)',
    example: 0.05,
    minimum: 0.0001,
  })
  quantity: number;
}

export class CreateRecipeRequestDto {
  @ApiProperty({
    description: 'Name of the recipe',
    example: 'Spicy Szechuan Noodles',
    minLength: 1,
    maxLength: 255,
  })
  readonly name: string;

  @ApiPropertyOptional({
    description: 'Description of the recipe',
    example: 'A fiery blend of noodles, szechuan pepper, and chili oil.',
    nullable: true,
  })
  readonly description?: string;

  @ApiProperty({
    type: [RecipeIngredientRequestDto],
    description: 'List of ingredients with quantities',
  })
  readonly ingredients: RecipeIngredientRequestDto[];
}

export class CreateRecipeResponseDto {
  constructor(public readonly recipeId: string) {}
}

@ApiTags('Recipes')
@Controller({ path: 'recipes', version: '1' })
export class CreateRecipeController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create recipe', description: 'Creates a new recipe with ingredients' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recipe created successfully',
    type: CreateRecipeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async create(@Body() dto: CreateRecipeRequestDto): Promise<CreateRecipeResponseDto> {
    const command = CreateRecipe.of(dto.name, dto.description, dto.ingredients);
    const result = await this.commandBus.execute<CreateRecipe, CreateRecipeResult>(command);

    return new CreateRecipeResponseDto(result.id);
  }
}
