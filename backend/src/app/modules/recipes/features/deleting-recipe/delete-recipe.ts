import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { Guard } from '@libs/core/validations/guard';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { RECIPE_REPOSITORY_TOKEN } from '../../recipes.tokens';

export class DeleteRecipe implements ICommand {
  constructor(public readonly id: string) {}

  static of(id: string | undefined): DeleteRecipe {
    const validatedId = Guard.notNullOrWhiteSpace(id, 'id', 'Recipe ID is required.');
    return new DeleteRecipe(validatedId.trim());
  }
}

export class DeleteRecipeResult {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteRecipe)
export class DeleteRecipeHandler implements ICommandHandler<DeleteRecipe, DeleteRecipeResult> {
  private readonly logger = new Logger(DeleteRecipeHandler.name);

  constructor(
    @Inject(RECIPE_REPOSITORY_TOKEN)
    private readonly repository: IRecipeRepository,
  ) {}

  async execute(command: DeleteRecipe): Promise<DeleteRecipeResult> {
    const { id } = command;

    const recipe = await this.repository.findById(id);
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID '${id}' not found.`);
    }

    const success = await this.repository.softDeleteById(id);
    if (!success) {
      throw new Error(`Failed to soft-delete recipe ${id}`);
    }

    this.logger.log(`Soft-deleted recipe ${id}`);

    return new DeleteRecipeResult(id);
  }
}
