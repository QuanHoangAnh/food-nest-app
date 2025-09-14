import { Recipe } from '../entities/recipe.entity';

export interface IRecipeRepository {
  /**
   * Persists a new or updated recipe.
   * If updating, optimistic concurrency (version) is enforced.
   */
  save(recipe: Recipe): Promise<Recipe>;

  /**
   * Finds a recipe by ID, only if not soft-deleted.
   */
  findById(id: string): Promise<Recipe | null>;

  /**
   * Returns paginated list of non-deleted recipes.
   */
  findAll(page: number, limit: number): Promise<{ items: Recipe[]; total: number }>;

  /**
   * Soft-deletes a recipe by setting `deletedAt = NOW()`.
   * Does NOT delete physically.
   * Associated RecipeIngredients remain but are hidden via parent filter.
   */
  softDeleteById(id: string): Promise<boolean>;

  /**
   * (Optional) Restores a soft-deleted recipe by setting `deletedAt = NULL`.
   */
  restoreById?(id: string): Promise<boolean>;
}
