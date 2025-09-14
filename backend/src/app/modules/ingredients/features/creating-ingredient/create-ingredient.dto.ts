import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIngredientPriceDto {
  @ApiProperty({
    description: 'Price value at a point in time',
    example: 2.99,
    minimum: 0.01,
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Date when this price became effective (defaults to now)',
    example: '2025-01-15T00:00:00Z',
    format: 'date-time',
  })
  changedAt?: string;
}

export class CreateIngredientRequestDto {
  @ApiProperty({
    description: 'Name of the ingredient (must be unique)',
    example: 'All-Purpose Flour',
    minLength: 1,
    maxLength: 255,
  })
  readonly name: string;

  @ApiProperty({
    description: 'Supplier or brand of the ingredient',
    example: 'Bob’s Mill',
    minLength: 1,
    maxLength: 255,
  })
  readonly supplier: string;

  @ApiPropertyOptional({
    type: [CreateIngredientPriceDto],
    description: 'Optional initial price history entries',
    example: [
      { price: 1.5, changedAt: '2024-01-01T00:00:00Z' },
      { price: 1.8, changedAt: '2024-06-01T00:00:00Z' },
    ],
  })
  readonly prices?: CreateIngredientPriceDto[];
}

export class CreateIngredientResponseDto {
  constructor(public readonly ingredientId: string) {}
}
