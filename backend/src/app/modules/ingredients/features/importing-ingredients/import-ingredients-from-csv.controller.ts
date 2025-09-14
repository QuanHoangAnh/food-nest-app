import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiPropertyOptional, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ImportIngredientsFromCsv, ImportIngredientsFromCsvResult } from './import-ingredients-from-csv';

export class ImportIngredientsFromCsvRequestDto {
  @ApiPropertyOptional({
    description: 'Optional path to CSV file. Defaults to /src/database/data/ingredients.csv',
    example: './custom-path/ingredients.csv',
  })
  readonly filePath?: string;
}

export class ImportIngredientsFromCsvResponseDto {
  constructor(
    public readonly importedCount: number,
    public readonly skippedCount: number,
    public readonly filePath: string,
  ) {}
}

@ApiTags('Ingredients')
@Controller({ path: 'ingredients', version: '1' })
export class ImportIngredientsFromCsvController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('import-from-csv')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import ingredients from CSV file' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ingredients imported successfully',
    type: ImportIngredientsFromCsvResponseDto,
  })
  async import(@Body() dto: ImportIngredientsFromCsvRequestDto): Promise<ImportIngredientsFromCsvResponseDto> {
    const command = ImportIngredientsFromCsv.of(dto.filePath);
    const result = await this.commandBus.execute<ImportIngredientsFromCsv, ImportIngredientsFromCsvResult>(command);

    return new ImportIngredientsFromCsvResponseDto(result.importedCount, result.skippedCount, result.filePath);
  }
}
