import { ApiProperty } from '@nestjs/swagger';

export class RecipeDto {
  @ApiProperty({
    description: 'Unique identifier for the recipe',
    example: 'rec_550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the recipe',
    example: 'Spicy Szechuan Noodles',
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    description: 'Optional description of the recipe',
    example: 'A fiery blend of noodles, szechuan pepper, and chili oil.',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'When the recipe was created',
    example: '2024-06-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the recipe was last modified',
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

  constructor(
    id: string,
    name: string,
    createdAt: Date,
    version: number,
    description?: string | null,
    lastModifiedAt?: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.version = version;
    this.lastModifiedAt = lastModifiedAt;
  }
}
