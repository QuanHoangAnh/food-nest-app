import { type IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { PriceDataItemDto } from '@app/modules/ingredients/dtos/price-data-item-dto';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import * as fs from 'fs';
import * as path from 'path';

import { INGREDIENT_REPOSITORY_TOKEN } from '../../ingredients.tokens';

export class ImportPriceChangesFromJson implements ICommand {
  constructor(public readonly filePath?: string) {}

  static of(filePath?: string): ImportPriceChangesFromJson {
    return new ImportPriceChangesFromJson(filePath);
  }
}

export class ImportPriceChangesFromJsonResult {
  constructor(
    public readonly importedCount: number,
    public readonly skippedCount: number,
    public readonly filePath: string,
  ) {}
}

@CommandHandler(ImportPriceChangesFromJson)
export class ImportPriceChangesFromJsonHandler
  implements ICommandHandler<ImportPriceChangesFromJson, ImportPriceChangesFromJsonResult>
{
  private readonly logger = new Logger(ImportPriceChangesFromJsonHandler.name);

  constructor(
    @Inject(INGREDIENT_REPOSITORY_TOKEN)
    private readonly repository: IIngredientRepository,
  ) {}

  async execute(command: ImportPriceChangesFromJson): Promise<ImportPriceChangesFromJsonResult> {
    const jsonPath = command.filePath ?? path.join(process.cwd(), 'src', 'database', 'data', 'price_changes.json');

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`JSON file not found at: ${jsonPath}`);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const priceData: PriceDataItemDto[] = JSON.parse(rawData);

    let imported = 0;
    let skipped = 0;

    for (const item of priceData) {
      const ingredient = await this.repository.findByName(item.ingredient_name);
      if (!ingredient) {
        skipped += item.price_changes.length;
        continue;
      }

      // Add all price changes to the ingredient's aggregate
      for (const priceChange of item.price_changes) {
        ingredient.addPrice(priceChange.price, new Date(priceChange.changed_at));
        imported++;
      }

      await this.repository.save(ingredient);
    }

    this.logger.log(`Imported ${imported} price changes, skipped ${skipped}`);

    return new ImportPriceChangesFromJsonResult(imported, skipped, jsonPath);
  }
}
