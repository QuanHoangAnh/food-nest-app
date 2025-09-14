import type { IIngredientRepository } from '@app/modules/ingredients/contracts/ingredient-repository';
import { guard } from '@libs/core/validations/guard';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { Ingredient } from '../../entities/ingredient.entity';
import { INGREDIENT_REPOSITORY_TOKEN } from '../../ingredients.tokens';

export class CreateIngredient implements ICommand {
  constructor(
    public readonly name: string,
    public readonly supplier: string,
    public readonly prices: { price: number; changedAt?: Date }[],
  ) {}

  static of(
    name: string | undefined,
    supplier: string | undefined,
    prices?: { price: number; changedAt?: string }[],
  ): CreateIngredient {
    const validatedName = guard.notNullOrWhiteSpace(name, 'name', 'Ingredient name is required.');
    const validatedSupplier = guard.notNullOrWhiteSpace(supplier, 'supplier', 'Supplier is required.');

    // ✅ Validate prices if provided
    const validatedPrices: { price: number; changedAt?: Date }[] = [];

    if (prices && prices.length > 0) {
      for (const p of prices) {
        guard.notNegativeOrZero(p.price, 'price', 'Price must be greater than zero.');
        if (p.changedAt) {
          const date = new Date(p.changedAt);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format for changedAt: ${p.changedAt}`);
          }
          validatedPrices.push({ price: p.price, changedAt: date });
        } else {
          validatedPrices.push({ price: p.price });
        }
      }
    }

    return new CreateIngredient(validatedName.trim(), validatedSupplier.trim(), validatedPrices);
  }
}

export class CreateIngredientResult {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly supplier: string,
    public readonly createdAt: Date,
  ) {}
}

@CommandHandler(CreateIngredient)
export class CreateIngredientHandler implements ICommandHandler<CreateIngredient, CreateIngredientResult> {
  private readonly logger = new Logger(CreateIngredientHandler.name);

  constructor(
    @Inject(INGREDIENT_REPOSITORY_TOKEN)
    private readonly repository: IIngredientRepository,
  ) {}

  async execute(command: CreateIngredient): Promise<CreateIngredientResult> {
    const { name, supplier, prices } = command;

    const existing = await this.repository.findByName(name);
    if (existing) {
      throw new Error(`Ingredient with name '${name}' already exists.`);
    }

    const ingredient = new Ingredient(name, supplier);

    if (prices && prices.length > 0) {
      for (const { price, changedAt = new Date() } of prices) {
        ingredient.addPrice(price, changedAt);
      }
    }

    const saved = await this.repository.save(ingredient);

    this.logger.log(
      `Created ingredient ${saved.id} with name '${name}'` +
        (prices?.length ? ` and ${prices.length} initial price(s)` : ''),
    );

    return new CreateIngredientResult(saved.id, saved.name, saved.supplier, saved.createdAt);
  }
}
