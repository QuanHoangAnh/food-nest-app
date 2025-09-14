import { ApiProperty } from '@nestjs/swagger';

export class RecipeIngredientDto {
  @ApiProperty({
    description: 'ID of the ingredient used',
    example: 'ingr_550e8400-e29b-41d4-a716-446655440000',
  })
  ingredientId: string;

  @ApiProperty({
    description: 'Name of the ingredient (for display)',
    example: 'SZECHUAN PEPPER 200G',
  })
  ingredientName: string;

  @ApiProperty({
    description: 'Quantity used in recipe',
    example: 0.05,
    minimum: 0.0001,
  })
  quantity: number;

  @ApiProperty({
    description: 'Latest unit price of the ingredient at time of cost calculation',
    example: 12.5,
    minimum: 0,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Cost for this ingredient line (may include specific item-related adjustments)',
    example: 22.5,
    minimum: 0,
  })
  lineCost: number;

  @ApiProperty({
    description: 'Total cost contribution: quantity * unitPrice',
    example: 0.625,
  })
  total: number;

  constructor(ingredientId: string, ingredientName: string, quantity: number, unitPrice: number, lineCost: number) {
    this.ingredientId = ingredientId;
    this.ingredientName = ingredientName;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.lineCost = lineCost;
    this.total = quantity * unitPrice;
  }
}
