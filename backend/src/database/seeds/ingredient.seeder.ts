// ingredient.seeder.ts
import { CsvRowDto } from '@app/modules/ingredients/dtos/csv-row-dto';
import { IngredientDataDto } from '@app/modules/ingredients/dtos/ingredient-data-dto';
import { PriceDataItemDto } from '@app/modules/ingredients/dtos/price-data-item-dto';
import { Ingredient } from '@app/modules/ingredients/entities/ingredient.entity';
import csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class IngredientSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const ingredientRepo = dataSource.getRepository(Ingredient);

    await dataSource.query('TRUNCATE TABLE "price_history" RESTART IDENTITY CASCADE;');
    await dataSource.query('TRUNCATE TABLE "ingredients" RESTART IDENTITY CASCADE;');

    // Load Ingredients from CSV
    const ingredientResults: IngredientDataDto[] = [];
    const csvPath = path.join(process.cwd(), 'src', 'database', 'data', 'ingredients.csv');

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    const stream = fs.createReadStream(csvPath).pipe(csv());

    for await (const row of stream) {
      const typedRow = row as CsvRowDto;
      const name = typedRow.name?.trim();
      const supplier = typedRow.supplier?.trim();

      if (!name || !supplier) {
        console.warn(`⚠️ Skipping invalid CSV row: ${JSON.stringify(row)}`);
        continue;
      }

      ingredientResults.push({ name, supplier });
    }

    console.log(`Parsed ${ingredientResults.length} valid ingredients from CSV`);

    // Save Ingredients
    const ingredientMap = new Map<string, Ingredient>();

    for (const data of ingredientResults) {
      const ingredient = new Ingredient(data.name, data.supplier);
      const saved = await ingredientRepo.save(ingredient);
      ingredientMap.set(data.name, saved);
    }

    console.log(`Seeded ${ingredientResults.length} ingredients`);

    // Load & Seed Price History from JSON
    const jsonPath = path.join(process.cwd(), 'src', 'database', 'data', 'price_changes.json');

    if (!fs.existsSync(jsonPath)) {
      console.warn(`⚠️ Price history file not found at: ${jsonPath} — skipping price seeding`);
      return;
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const priceData: PriceDataItemDto[] = JSON.parse(rawData);

    let totalPricesSeeded = 0;

    for (const item of priceData) {
      const ingredientName = item.ingredient_name;
      const ingredient = ingredientMap.get(ingredientName);

      if (!ingredient) {
        console.warn(`⚠️ Ingredient not found for price history: "${ingredientName}" — skipping`);
        continue;
      }

      for (const priceChange of item.price_changes) {
        ingredient.addPrice(priceChange.price, new Date(priceChange.changed_at));
        totalPricesSeeded++;
      }

      await ingredientRepo.save(ingredient);
    }

    console.log(`Seeded ${totalPricesSeeded} price history records`);
  }
}
