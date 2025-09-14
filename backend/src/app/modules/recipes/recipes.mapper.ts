import { RecipeDto } from './dto/recipe-dto';
import { Recipe } from './entities/recipe.entity';

export class RecipesMapper {
  /**
   * Maps a Recipe entity to RecipeDto for API response
   */
  static recipeToRecipeDto(recipe: Recipe): RecipeDto {
    return new RecipeDto(
      recipe.id,
      recipe.name,
      recipe.createdAt,
      recipe.version,
      recipe.description,
      recipe.lastModifiedAt,
    );
  }

  /**
   * Optional: Maps a partial RecipeDto to an existing or new Recipe entity
   * Useful for update operations — does NOT map system-managed fields
   */
  static recipeDtoToRecipe(dto: Partial<RecipeDto>, existing?: Recipe): Recipe {
    const recipe = existing ?? new Recipe('', null);

    if (dto.name !== undefined) recipe.name = dto.name;
    if (dto.description !== undefined) recipe.description = dto.description;

    // Do NOT map: id, createdAt, version, lastModifiedAt — those are system-managed
    return recipe;
  }
}
