import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { IIngredientRepository } from '../contracts/ingredient-repository';
import { Ingredient } from '../entities/ingredient.entity';

@Injectable()
export class IngredientRepository implements IIngredientRepository {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
  ) {}

  async save(ingredient: Ingredient): Promise<Ingredient> {
    return await this.ingredientRepo.save(ingredient);
  }

  async findById(id: string): Promise<Ingredient | null> {
    return await this.ingredientRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['priceHistory'],
    });
  }

  async findByName(name: string): Promise<Ingredient | null> {
    return await this.ingredientRepo.findOne({
      where: { name, deletedAt: IsNull() },
      relations: ['priceHistory'],
    });
  }

  async findAll(page: number, limit: number): Promise<{ items: Ingredient[]; total: number }> {
    const skip = (page - 1) * limit;

    const total = await this.ingredientRepo.count({
      where: { deletedAt: IsNull() },
    });

    const items = await this.ingredientRepo.find({
      where: { deletedAt: IsNull() },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['priceHistory'],
    });

    return { items, total };
  }

  async getLatestPrice(ingredientId: string): Promise<number | null> {
    const ingredient = await this.findById(ingredientId);
    if (!ingredient?.priceHistory || ingredient.priceHistory.length === 0) return null;

    const latest = ingredient.priceHistory.sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())[0];
    return latest?.price ?? null;
  }

  async softDeleteById(id: string): Promise<boolean> {
    const result = await this.ingredientRepo.delete(id);
    return result.affected !== 0;
  }

  async findByIds(ids: string[]): Promise<Ingredient[]> {
    if (ids.length === 0) return [];

    return await this.ingredientRepo.find({
      where: {
        id: In(ids),
        deletedAt: IsNull(),
      },
      relations: ['priceHistory'],
    });
  }

  async restoreById(id: string): Promise<boolean> {
    const result = await this.ingredientRepo.update(id, { deletedAt: null });
    return result.affected !== 0;
  }
}
