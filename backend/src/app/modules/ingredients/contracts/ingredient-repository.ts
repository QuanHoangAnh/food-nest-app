import { Ingredient } from '../entities/ingredient.entity';

export interface IIngredientRepository {
  /**
   * Persists a new or updated ingredient.
   * If updating, optimistic concurrency (version) is enforced.
   */
  save(ingredient: Ingredient): Promise<Ingredient>;

  /**
   * Finds an ingredient by ID, only if not soft-deleted.
   */
  findById(id: string): Promise<Ingredient | null>;

  findByIds(ids: string[]): Promise<Ingredient[]>;

  /**
   * Finds an ingredient by name, only if not soft-deleted.
   */
  findByName(name: string): Promise<Ingredient | null>;

  findAll(page: number, limit: number): Promise<{ items: Ingredient[]; total: number }>;

  /**
   * Returns the latest price for the given ingredient (only if ingredient is not deleted).
   * Returns null if no price history exists or ingredient is deleted.
   */
  getLatestPrice(ingredientId: string): Promise<number | null>;

  /**
   * Soft-deletes an ingredient by setting `deletedAt = NOW()`.
   * Does NOT delete physically.
   */
  softDeleteById(id: string): Promise<boolean>;

  /**
   * (Optional) Restores a soft-deleted ingredient by setting `deletedAt = NULL`.
   */
  restoreById?(id: string): Promise<boolean>;
}
