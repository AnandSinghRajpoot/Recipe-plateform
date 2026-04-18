package com.recipeplatform.service;

import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import java.util.List;
import java.util.Map;

public interface RecommendationService {
    /**
     * Get personalized recipe recommendations for the current user.
     * @param limit Number of results to return.
     * @param filters Optional categorical filters (mealType, dietType, etc.)
     * @return Ranked list of recipes.
     */
    List<RecipeResponseDTO> getRecommendedRecipes(int limit, Map<String, String> filters);
}
