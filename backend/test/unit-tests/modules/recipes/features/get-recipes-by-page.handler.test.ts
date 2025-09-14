import type { IRecipeRepository } from '@app/modules/recipes/contracts/recipe-repository';
import { RecipeDto } from '@app/modules/recipes/dto/recipe-dto';
import {
  GetRecipesByPageHandler,
  GetRecipesByPageQuery,
  GetRecipesByPageResult,
} from '@app/modules/recipes/features/getting-recipes/get-recipes-by-page';
import { RECIPE_REPOSITORY_TOKEN } from '@app/modules/recipes/recipes.tokens';
import { Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ValidationException } from '@libs/core/validations/validation-exception';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeRecipe } from '../../../../shared/fakes/fake-recipe';

describe('GetRecipesByPageHandler', () => {
  let handler: GetRecipesByPageHandler;
  let repository: SubstituteOf<IRecipeRepository>;

  beforeEach(async () => {
    repository = Substitute.for<IRecipeRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRecipesByPageHandler,
        {
          provide: RECIPE_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<GetRecipesByPageHandler>(GetRecipesByPageHandler);
  });

  describe('Given valid page and limit', () => {
    it('should return paginated recipes', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const query = GetRecipesByPageQuery.of(page, limit);

      const fakeRecipes = Array(5)
        .fill(null)
        .map(() => FakeRecipe.generate());

      repository.findAll(page, limit).returns(
        Promise.resolve({
          items: fakeRecipes,
          total: 25,
        }),
      );

      // Act
      const result = await handler.execute(query);

      // Assert
      repository.received(1).findAll(page, limit);

      expect(result).toBeInstanceOf(GetRecipesByPageResult);
      expect(result.items).toHaveLength(5);
      expect(result.items.every(x => x instanceof RecipeDto)).toBe(true);
      expect(result.total).toBe(25);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
    });
  });

  describe('Given invalid page or limit', () => {
    it('should throw validation error when page is <= 0', () => {
      expect(() => GetRecipesByPageQuery.of(0, 10)).toThrow(new ValidationException('Page must be >= 1'));
      expect(() => GetRecipesByPageQuery.of(-1, 10)).toThrow(new ValidationException('Page must be >= 1'));
    });

    it('should throw validation error when limit is <= 0', () => {
      expect(() => GetRecipesByPageQuery.of(1, 0)).toThrow(new ValidationException('Limit must be >= 1'));
      expect(() => GetRecipesByPageQuery.of(1, -5)).toThrow(new ValidationException('Limit must be >= 1'));
    });
  });
});
