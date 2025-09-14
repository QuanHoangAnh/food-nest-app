import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { RecipeIngredientDto } from '@app/modules/recipes/dto/recipe-ingredient-dto';
import { RecipeWithCostDto } from '@app/modules/recipes/dto/recipe-with-cost-dto';
import {
  GetRecipeByIdWithCostHandler,
  GetRecipeByIdWithCostQuery,
  GetRecipeByIdWithCostResult,
} from '@app/modules/recipes/features/getting-recipe-by-id-with-cost/get-recipe-by-id-with-cost';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { CalculateRecipeCostService } from '@app/modules/recipes/services/calculate-recipe-cost.service';
import { faker } from '@faker-js/faker';
import { Arg, Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeRecipe } from '../../../../shared/fakes/fake-recipe';

describe('GetRecipeByIdWithCostHandler', () => {
  let handler: GetRecipeByIdWithCostHandler;
  let repository: SubstituteOf<IRecipeRepository>;
  let costCalculator: SubstituteOf<CalculateRecipeCostService>;

  beforeEach(async () => {
    repository = Substitute.for<IRecipeRepository>();
    costCalculator = Substitute.for<CalculateRecipeCostService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRecipeByIdWithCostHandler,
        {
          provide: RECIPE_REPOSITORY_TOKEN,
          useValue: repository,
        },
        {
          provide: CalculateRecipeCostService,
          useValue: costCalculator,
        },
      ],
    }).compile();

    handler = module.get<GetRecipeByIdWithCostHandler>(GetRecipeByIdWithCostHandler);
  });

  describe('Given valid ID', () => {
    it('should return recipe with cost when found', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const query = GetRecipeByIdWithCostQuery.of(recipeId);

      const fakeRecipe = FakeRecipe.withRandomIngredients({ id: recipeId });
      const mockCostResult = {
        ingredients: [
          {
            ingredientId: faker.string.uuid(),
            ingredientName: 'Flour',
            quantity: 2,
            unitPrice: 1.5,
            lineCost: 3.0,
          },
        ],
        totalCost: 3.0,
      };

      repository.findById(recipeId).returns(Promise.resolve(fakeRecipe));
      costCalculator.calculate(Arg.any(), Arg.any()).returns(Promise.resolve(mockCostResult));

      // Act
      const result = await handler.execute(query);

      // Assert
      repository.received(1).findById(recipeId);
      costCalculator.received(1).calculate(
        Arg.is(r => r.id === recipeId),
        true,
      ); // default: useCache=true

      expect(result).toBeInstanceOf(GetRecipeByIdWithCostResult);
      expect(result.recipeWithCost).toBeInstanceOf(RecipeWithCostDto);
      expect(result.recipeWithCost.ingredients).toHaveLength(1);
      expect(result.recipeWithCost.ingredients[0]).toBeInstanceOf(RecipeIngredientDto);
    });

    it('should bypass cache when requested', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const query = GetRecipeByIdWithCostQuery.of(recipeId, true);

      const fakeRecipe = FakeRecipe.generate({ id: recipeId });
      const mockCostResult = { ingredients: [], totalCost: 0 };

      repository.findById(recipeId).returns(Promise.resolve(fakeRecipe));
      costCalculator.calculate(Arg.any(), Arg.any()).returns(Promise.resolve(mockCostResult));

      // Act
      await handler.execute(query);

      // Assert
      costCalculator.received(1).calculate(Arg.any(), false); // useCache=false
    });

    it('should throw NotFoundException if recipe not found', async () => {
      // Arrange
      const recipeId = faker.string.uuid();
      const query = GetRecipeByIdWithCostQuery.of(recipeId);

      repository.findById(recipeId).returns(Promise.resolve(null));

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(query)).rejects.toThrow(`Recipe with ID '${recipeId}' not found.`);
    });
  });

  describe('Given invalid ID', () => {
    it('should throw validation error when ID is null or whitespace', () => {
      expect(() => GetRecipeByIdWithCostQuery.of('')).toThrow(new ValidationException('Recipe ID is required.'));
      expect(() => GetRecipeByIdWithCostQuery.of(null as any)).toThrow(
        new ValidationException('Recipe ID is required.'),
      );
      expect(() => GetRecipeByIdWithCostQuery.of('   ')).toThrow(new ValidationException('Recipe ID is required.'));
    });
  });
});
