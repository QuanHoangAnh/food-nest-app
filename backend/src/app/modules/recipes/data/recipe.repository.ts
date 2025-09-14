import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { IRecipeRepository } from '../contracts/recipe-repository';
import { Recipe } from '../entities/recipe.entity';

@Injectable()
export class RecipeRepository implements IRecipeRepository {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
  ) {}

  async save(recipe: Recipe): Promise<Recipe> {
    return await this.recipeRepo.save(recipe);
  }

  async findById(id: string): Promise<Recipe | null> {
    return await this.recipeRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['ingredients'],
    });
  }

  async findAll(page: number, limit: number): Promise<{ items: Recipe[]; total: number }> {
    const skip = (page - 1) * limit;

    const total = await this.recipeRepo.count({
      where: { deletedAt: IsNull() },
    });

    const items = await this.recipeRepo.find({
      where: { deletedAt: IsNull() },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['ingredients'],
    });

    return { items, total };
  }

  async softDeleteById(id: string): Promise<boolean> {
    const result = await this.recipeRepo.delete(id);
    return result.affected !== 0;
  }

  async restoreById(id: string): Promise<boolean> {
    const result = await this.recipeRepo.update(id, { deletedAt: null });
    return result.affected !== 0;
  }
}
