import type { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { guard } from '@libs/core/validations/guard';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { INGREDIENT_REPOSITORY_TOKEN } from '../../ingredients.tokens';

export class AddPriceToIngredient implements ICommand {
  constructor(
    public readonly ingredientId: string,
    public readonly price: number,
  ) {}

  static of(ingredientId: string | undefined, price: number | undefined): AddPriceToIngredient {
    guard.notNullOrWhiteSpace(ingredientId, 'ingredientId', 'Ingredient ID is required.');
    guard.notNegativeOrZero(price, 'price', 'Price must be greater than zero.');

    return new AddPriceToIngredient(ingredientId!.trim(), price!);
  }
}

export class AddPriceToIngredientResult {
  constructor(
    public readonly ingredientId: string,
    public readonly price: number,
    public readonly changedAt: Date,
  ) {}
}

@CommandHandler(AddPriceToIngredient)
export class AddPriceToIngredientHandler implements ICommandHandler<AddPriceToIngredient, AddPriceToIngredientResult> {
  private readonly logger = new Logger(AddPriceToIngredientHandler.name);

  constructor(
    @Inject(INGREDIENT_REPOSITORY_TOKEN)
    private readonly repository: IIngredientRepository,
  ) {}

  async execute(command: AddPriceToIngredient): Promise<AddPriceToIngredientResult> {
    const { ingredientId, price } = command;

    const ingredient = await this.repository.findById(ingredientId);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID '${ingredientId}' not found.`);
    }

    ingredient.addPrice(price, new Date());

    await this.repository.save(ingredient);

    const changedAt = new Date(); // or get from saved entity if needed

    this.logger.log(`Added price $${price} to ingredient ${ingredientId}`);

    return new AddPriceToIngredientResult(ingredientId, price, changedAt);
  }
}
