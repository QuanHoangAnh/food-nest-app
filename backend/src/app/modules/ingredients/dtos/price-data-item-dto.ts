export interface PriceDataItemDto {
  ingredient_name: string;
  price_changes: PriceChangeEntryDto[];
}

export interface PriceChangeEntryDto {
  changed_at: string;
  price: number;
}
