package com.recipeplatform.service;

import com.recipeplatform.dto.RecipeRecommendationDTO;

import java.util.List;

public interface RecommendationEngine {

    /**
     * Get personalized recipe recommendations for a user
     * 
     * @param userId The user ID
     * @param limit  Maximum number of recommendations to return
     * @return List of recommended recipes with scores
     */
    List<RecipeRecommendationDTO> getRecommendations(Long userId, int limit);
}
