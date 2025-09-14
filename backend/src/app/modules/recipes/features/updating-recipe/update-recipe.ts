import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { Guard } from '@libs/core/validations/guard';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { RECIPE_REPOSITORY_TOKEN } from '../../recipes.tokens';

export class UpdateRecipe implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string | null,
  ) {}

  static of(id: string | undefined, name: string | undefined, description: string | null | undefined): UpdateRecipe {
    const validatedId = Guard.notNullOrWhiteSpace(id, 'id', 'Recipe ID is required.');

    // At least one field must be provided
    if (!name && description === undefined) {
      throw new Error('At least one field (name or description) must be provided for update.');
    }

    return new UpdateRecipe(validatedId.trim(), name?.trim(), description?.trim() || null);
  }
}

export class UpdateRecipeResult {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly lastModifiedAt?: Date,
    public readonly description?: string | null,
  ) {}
}

@CommandHandler(UpdateRecipe)
export class UpdateRecipeHandler implements ICommandHandler<UpdateRecipe, UpdateRecipeResult> {
  private readonly logger = new Logger(UpdateRecipeHandler.name);

  constructor(
    @Inject(RECIPE_REPOSITORY_TOKEN)
    private readonly repository: IRecipeRepository,
  ) {}

  async execute(command: UpdateRecipe): Promise<UpdateRecipeResult> {
    const { id, name, description } = command;

    const recipe = await this.repository.findById(id);
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID '${id}' not found.`);
    }

    if (name !== undefined) recipe.name = name;
    if (description !== undefined) recipe.description = description;

    const updated = await this.repository.save(recipe);

    this.logger.log(`Updated recipe ${id} - new version: ${updated.version}`);

    return new UpdateRecipeResult(updated.id, updated.name, updated.lastModifiedAt, updated.description);
  }
}
