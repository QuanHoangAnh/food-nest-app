import { ApiProperty } from '@nestjs/swagger';

export class AddPriceToIngredientRequestDto {
  @ApiProperty({
    description: 'New price for the ingredient',
    example: 2.99,
    minimum: 0.01,
  })
  readonly price: number;
}

export class AddPriceToIngredientResponseDto {
  constructor(
    public readonly ingredientId: string,
    public readonly price: number,
    public readonly changedAt: Date,
  ) {}
}
