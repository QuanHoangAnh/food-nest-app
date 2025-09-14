import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { guard } from '@libs/core/validations/guard';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { Recipe } from '../../entities/recipe.entity';
import { RECIPE_REPOSITORY_TOKEN } from '../../recipes.tokens';

export class CreateRecipe implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly ingredients: { ingredientId: string; quantity: number }[],
  ) {}

  static of(
    name: string | undefined,
    description: string | null | undefined,
    ingredients: { ingredientId: string; quantity: number }[] | undefined,
  ): CreateRecipe {
    const validatedName = guard.notNullOrWhiteSpace(name, 'name', 'Recipe name is required.');
    const validatedIngredients = guard.notEmptyOrNullCollection(
      ingredients,
      'ingredients',
      'At least one ingredient is required.',
    );

    for (const ing of validatedIngredients) {
      guard.notNullOrWhiteSpace(ing.ingredientId, 'ingredientId', 'Ingredient ID is required.');
      guard.notNegativeOrZero(ing.quantity, 'quantity', 'Quantity must be greater than zero.');
    }

    return new CreateRecipe(validatedName.trim(), description?.trim() ?? null, validatedIngredients);
  }
}

export class CreateRecipeResult {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly description?: string | null,
  ) {}
}

@CommandHandler(CreateRecipe)
export class CreateRecipeHandler implements ICommandHandler<CreateRecipe, CreateRecipeResult> {
  private readonly logger = new Logger(CreateRecipeHandler.name);

  constructor(
    @Inject(RECIPE_REPOSITORY_TOKEN)
    private readonly repository: IRecipeRepository,
  ) {}

  async execute(command: CreateRecipe): Promise<CreateRecipeResult> {
    const { name, description, ingredients } = command;

    const recipe = new Recipe(name, description);

    for (const ing of ingredients) {
      recipe.addIngredient(ing.ingredientId, ing.quantity);
    }

    const savedRecipe = await this.repository.save(recipe);

    this.logger.log(`Created recipe ${savedRecipe.id} with name '${name}'`);

    return new CreateRecipeResult(savedRecipe.id, savedRecipe.name, savedRecipe.createdAt, savedRecipe.description);
  }
}
