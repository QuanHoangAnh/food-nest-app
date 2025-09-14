import { AuditableSoftDeleteEntity } from '@libs/core/entity/auditable-entity';

import { RecipeIngredient } from './recipe-ingredient.entity';

export class Recipe extends AuditableSoftDeleteEntity<string> {
  name: string;
  description?: string | null;
  ingredients: RecipeIngredient[];

  constructor(name: string, description?: string | null) {
    super();
    this.name = name;
    this.description = description;
  }

  addIngredient(ingredientId: string, quantity: number): void {
    if (!ingredientId || ingredientId.trim() === '') {
      throw new Error('Ingredient ID is required.');
    }
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }

    if (!this.ingredients) {
      this.ingredients = [];
    }

    const ingredient = new RecipeIngredient(quantity, this.id, ingredientId);
    this.ingredients.push(ingredient);
  }

  removeIngredient(ingredientId: string): void {
    if (!this.ingredients) return;
    this.ingredients = this.ingredients.filter(ri => ri.id !== ingredientId);
  }

  get ingredientItems(): RecipeIngredient[] {
    return this.ingredients || [];
  }
}
