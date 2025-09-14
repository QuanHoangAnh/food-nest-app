// create-recipe.handler.spec.ts
import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import {
  CreateRecipe,
  CreateRecipeHandler,
  CreateRecipeResult,
} from '@app/modules/recipes/features/creating-recipe/create-recipe';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { faker } from '@faker-js/faker';
import { Arg, Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeRecipe } from '../../../../shared/fakes/fake-recipe';

describe('CreateRecipeHandler', () => {
  let handler: CreateRecipeHandler;
  let repository: SubstituteOf<IRecipeRepository>;

  beforeEach(async () => {
    repository = Substitute.for<IRecipeRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRecipeHandler,
        {
          provide: RECIPE_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<CreateRecipeHandler>(CreateRecipeHandler);
  });

  describe('Given valid recipe data', () => {
    it('should create recipe and cascade-save its ingredients successfully', async () => {
      // Arrange
      const recipeName = faker.commerce.productName();
      const recipeDescription = faker.commerce.productDescription();
      const ingredients = [
        { ingredientId: faker.string.uuid(), quantity: 0.1 },
        { ingredientId: faker.string.uuid(), quantity: 0.05 },
      ];

      const command = CreateRecipe.of(recipeName, recipeDescription, ingredients);

      const fakeRecipe = FakeRecipe.withIngredients(ingredients, {
        name: recipeName,
        description: recipeDescription,
      });

      repository.save(Arg.any()).returns(Promise.resolve(fakeRecipe));

      // Act
      const result = await handler.execute(command);

      // Assert
      repository
        .received(1)
        .save(
          Arg.is(
            r =>
              r.name === recipeName &&
              r.description === recipeDescription &&
              r.ingredients?.length === 2 &&
              r.ingredients[0].ingredientId === ingredients[0].ingredientId &&
              r.ingredients[0].quantity === ingredients[0].quantity &&
              r.ingredients[1].ingredientId === ingredients[1].ingredientId &&
              r.ingredients[1].quantity === ingredients[1].quantity,
          ),
        );

      // Verify
      expect(result).toBeInstanceOf(CreateRecipeResult);
      expect(result.name).toBe(recipeName);
      expect(result.description).toBe(recipeDescription);
      expect(result.id).toBe(fakeRecipe.id);
    });
  });

  describe('Given invalid name', () => {
    it('should throw validation error when name is null or whitespace', () => {
      expect(() => CreateRecipe.of('', 'desc', [{ ingredientId: 'ingr-1', quantity: 1 }])).toThrow(
        new ValidationException('Recipe name is required.'),
      );
      expect(() => CreateRecipe.of(null as any, 'desc', [{ ingredientId: 'ingr-1', quantity: 1 }])).toThrow(
        new ValidationException('Recipe name is required.'),
      );
      expect(() => CreateRecipe.of('   ', 'desc', [{ ingredientId: 'ingr-1', quantity: 1 }])).toThrow(
        new ValidationException('Recipe name is required.'),
      );
    });
  });

  describe('Given invalid ingredients', () => {
    it('should throw validation error when ingredients is null or empty', () => {
      expect(() => CreateRecipe.of('Recipe', 'desc', null as any)).toThrow(
        new ValidationException('At least one ingredient is required.'),
      );
      expect(() => CreateRecipe.of('Recipe', 'desc', [])).toThrow(
        new ValidationException('At least one ingredient is required.'),
      );
    });

    it('should throw validation error when ingredientId is invalid', () => {
      expect(() => CreateRecipe.of('Recipe', 'desc', [{ ingredientId: '', quantity: 1 }])).toThrow(
        new ValidationException('Ingredient ID is required.'),
      );
      expect(() => CreateRecipe.of('Recipe', 'desc', [{ ingredientId: null as any, quantity: 1 }])).toThrow(
        new ValidationException('Ingredient ID is required.'),
      );
    });

    it('should throw validation error when quantity is invalid', () => {
      expect(() => CreateRecipe.of('Recipe', 'desc', [{ ingredientId: 'ingr-1', quantity: 0 }])).toThrow(
        new ValidationException('Quantity must be greater than zero.'),
      );
      expect(() => CreateRecipe.of('Recipe', 'desc', [{ ingredientId: 'ingr-1', quantity: -0.1 }])).toThrow(
        new ValidationException('Quantity must be greater than zero.'),
      );
    });
  });

  describe('Given repository.save throws error', () => {
    it('should propagate error', async () => {
      // Arrange
      const command = CreateRecipe.of(faker.commerce.productName(), faker.commerce.productDescription(), [
        { ingredientId: faker.string.uuid(), quantity: 0.1 },
      ]);

      repository.save(Arg.any()).throws(new Error('Database error'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Database error');
    });
  });
});
