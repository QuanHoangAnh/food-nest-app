import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiPropertyOptional, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ImportPriceChangesFromJson, ImportPriceChangesFromJsonResult } from './import-price-changes-from-json';

export class ImportPriceChangesFromJsonRequestDto {
  @ApiPropertyOptional({
    description: 'Optional path to JSON file. Defaults to /src/database/data/price_changes.json',
    example: './custom-path/price_changes.json',
  })
  readonly filePath?: string;
}

export class ImportPriceChangesFromJsonResponseDto {
  constructor(
    public readonly importedCount: number,
    public readonly skippedCount: number,
    public readonly filePath: string,
  ) {}
}

@ApiTags('Ingredients')
@Controller({ path: 'ingredients', version: '1' })
export class ImportPriceChangesFromJsonController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('import-price-changes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import price changes from JSON file' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Price changes imported successfully',
    type: ImportPriceChangesFromJsonResponseDto,
  })
  async import(@Body() dto: ImportPriceChangesFromJsonRequestDto): Promise<ImportPriceChangesFromJsonResponseDto> {
    const command = ImportPriceChangesFromJson.of(dto.filePath);
    const result = await this.commandBus.execute<ImportPriceChangesFromJson, ImportPriceChangesFromJsonResult>(command);

    return new ImportPriceChangesFromJsonResponseDto(result.importedCount, result.skippedCount, result.filePath);
  }
}
