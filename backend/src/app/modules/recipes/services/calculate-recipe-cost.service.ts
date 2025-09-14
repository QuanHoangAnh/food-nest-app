import type { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { INGREDIENT_REPOSITORY_TOKEN } from '@app/modules/ingredients/ingredients.tokens';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Cache } from 'cache-manager';

import { IngredientCostDto } from '../dto/ingredient-cost-dto';
import { Recipe } from '../entities/recipe.entity';

@Injectable()
export class CalculateRecipeCostService {
  constructor(
    @Inject(INGREDIENT_REPOSITORY_TOKEN)
    private readonly ingredientRepository: IIngredientRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async calculate(recipe: Recipe, useCache = true): Promise<{ ingredients: IngredientCostDto[]; totalCost: number }> {
    const ingredientCosts: IngredientCostDto[] = [];
    let totalCost = 0;

    const ingredientIds = [...new Set(recipe.ingredients.map(ri => ri.ingredientId))];
    const ingredientsMap = await this.fetchIngredientsMap(ingredientIds);

    for (const ri of recipe.ingredients) {
      let latestPrice: number;

      if (useCache) {
        latestPrice = await this.getCachedLatestPrice(ri.ingredientId);
      } else {
        const price = await this.ingredientRepository.getLatestPrice(ri.ingredientId);
        if (price === null) {
          throw new NotFoundException(`No price found for ingredient ID: ${ri.ingredientId}`);
        }
        latestPrice = price;
      }

      const ingredient = ingredientsMap.get(ri.ingredientId);
      const ingredientName = ingredient?.name ?? 'Unknown';

      const lineCost = ri.quantity * latestPrice;
      totalCost += lineCost;

      ingredientCosts.push(new IngredientCostDto(ri.ingredientId, ri.quantity, latestPrice, lineCost, ingredientName));
    }

    return { ingredients: ingredientCosts, totalCost };
  }

  private async getCachedLatestPrice(ingredientId: string): Promise<number> {
    const cacheKey = `price:${ingredientId}`;
    let price = await this.cacheManager.get<number>(cacheKey);

    if (price === undefined) {
      const freshPrice = await this.ingredientRepository.getLatestPrice(ingredientId);
      if (freshPrice === null) {
        throw new NotFoundException(`No price found for ingredient ID: ${ingredientId}`);
      }
      price = freshPrice;
      // Cache for 5 minutes (300 seconds)
      await this.cacheManager.set(cacheKey, price, 300);
    }

    return price;
  }

  private async fetchIngredientsMap(ids: string[]): Promise<Map<string, { id: string; name: string }>> {
    if (ids.length === 0) return new Map();

    const ingredients = await this.ingredientRepository.findByIds(ids);
    return new Map(ingredients.map(ing => [ing.id, { id: ing.id, name: ing.name }]));
  }
}
