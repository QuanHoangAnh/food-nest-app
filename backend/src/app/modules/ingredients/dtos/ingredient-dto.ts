import { ApiProperty } from '@nestjs/swagger';

export class IngredientDto {
  @ApiProperty({
    description: 'Unique identifier for the ingredient',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the ingredient (e.g. "SZECHUAN PEPPER 200G")',
    example: 'SZECHUAN PEPPER 200G',
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    description: 'Supplier of the ingredient',
    example: 'ALBION FINE FOODS',
    maxLength: 255,
  })
  supplier: string;

  @ApiProperty({
    description: 'When the ingredient was created',
    example: '2024-06-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the ingredient was last modified',
    example: '2024-06-16T14:22:10.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  lastModifiedAt?: Date;

  @ApiProperty({
    description: 'Optimistic concurrency version number',
    example: 1,
    minimum: 1,
  })
  version: number;

  constructor(id: string, name: string, supplier: string, createdAt: Date, version: number, lastModifiedAt?: Date) {
    this.id = id;
    this.name = name;
    this.supplier = supplier;
    this.createdAt = createdAt;
    this.version = version;
    this.lastModifiedAt = lastModifiedAt;
  }
}
