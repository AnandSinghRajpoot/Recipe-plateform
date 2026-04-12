package com.recipeplatform.service;

import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.RecipeRecommendationDTO;

import java.util.List;

public interface RecommendationEngine {

    /**
     * Get personalized recipe recommendations for a user.
     * Phase 1: Hard filter out allergens
     * Phase 2: Boost recipes safe for user's diseases
     * Phase 3: Score by diet, nutrition, etc.
     */
    List<RecipeRecommendationDTO> getRecommendations(Long userId, int limit);

    /**
     * Get recommendations filtered by a specific meal type.
     */
    List<RecipeRecommendationDTO> getByMealType(Long userId, MealType mealType, int limit);
}
