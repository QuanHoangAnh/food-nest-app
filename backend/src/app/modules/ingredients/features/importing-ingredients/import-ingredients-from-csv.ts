import { type IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { CsvRowDto } from '@app/modules/ingredients/dtos/csv-row-dto';
import { guard } from '@libs/core/validations/guard';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

import { Ingredient } from '../../entities/ingredient.entity';
import { INGREDIENT_REPOSITORY_TOKEN } from '../../ingredients.tokens';

export class ImportIngredientsFromCsv implements ICommand {
  constructor(public readonly filePath?: string) {}

  static of(filePath?: string): ImportIngredientsFromCsv {
    guard.notNullOrWhiteSpace(filePath, 'filePath', 'File path is required.');
    return new ImportIngredientsFromCsv(filePath);
  }
}

export class ImportIngredientsFromCsvResult {
  constructor(
    public readonly importedCount: number,
    public readonly skippedCount: number,
    public readonly filePath: string,
  ) {}
}

@CommandHandler(ImportIngredientsFromCsv)
export class ImportIngredientsFromCsvHandler
  implements ICommandHandler<ImportIngredientsFromCsv, ImportIngredientsFromCsvResult>
{
  private readonly logger = new Logger(ImportIngredientsFromCsvHandler.name);

  constructor(
    @Inject(INGREDIENT_REPOSITORY_TOKEN)
    private readonly repository: IIngredientRepository,
  ) {}

  async execute(command: ImportIngredientsFromCsv): Promise<ImportIngredientsFromCsvResult> {
    const csvPath = command.filePath ?? path.join(process.cwd(), 'src', 'database', 'data', 'ingredients.csv');

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    let imported = 0;
    let skipped = 0;

    const stream = fs.createReadStream(csvPath).pipe(csv());

    for await (const row of stream) {
      const typedRow = row as CsvRowDto;
      const name = typedRow.name.trim();
      const supplier = typedRow.supplier.trim();

      if (!name || !supplier) {
        skipped++;
        continue;
      }

      let ingredient = await this.repository.findByName(name);
      if (!ingredient) {
        ingredient = new Ingredient(name, supplier);
        await this.repository.save(ingredient);
        imported++;
      } else {
        skipped++;
      }
    }

    this.logger.log(`Imported ${imported} ingredients, skipped ${skipped}`);

    return new ImportIngredientsFromCsvResult(imported, skipped, csvPath);
  }
}
