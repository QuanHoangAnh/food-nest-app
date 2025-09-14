export class IngredientCostDto {
  constructor(
    public readonly ingredientId: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly lineCost: number,
    public readonly ingredientName: string,
  ) {}
}
