package com.recipeplatform.service.impl;

import com.recipeplatform.domain.*;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.mapper.RecipeMapper;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.SavedRecipeRepository;
import com.recipeplatform.repository.UserHealthProfileRepository;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.service.RecommendationService;
import com.recipeplatform.util.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final RecipeRepository recipeRepository;
    private final UserHealthProfileRepository healthProfileRepository;
    private final SavedRecipeRepository savedRecipeRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;
    private final RecipeMapper recipeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getRecommendedRecipes(int limit, Map<String, String> filters) {
        User user = null;
        try {
            user = currentUser.getCurrentUser();
        } catch (Exception e) {
            // Unauthenticated user
        }

        if (user == null) {
            // Return popular recipes for guests
            return recipeRepository.findByIsPublishedTrueAndDeletedAtIsNull()
                    .stream()
                    .sorted(Comparator.comparingDouble((Recipe r) -> r.getAverageRating() != null ? r.getAverageRating() : 0).reversed())
                    .limit(limit)
                    .map(recipeMapper::toResponseDTO)
                    .collect(Collectors.toList());
        }

        // Re-fetch user to ensure session attachment for lazy collections
        User principal = user;
        User finalUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<UserHealthProfile> healthProfileOpt = healthProfileRepository.findByUserId(finalUser.getId());

        // 1. Get Allergens for strict exclusion
        Set<Long> userAllergenIds = new HashSet<>();
        healthProfileOpt.ifPresent(hp -> {
            userAllergenIds.addAll(hp.getAllergies().stream()
                    .map(ua -> ua.getAllergy().getId())
                    .collect(Collectors.toSet()));
        });

        // 2. Fetch recipes excluding allergens
        List<Recipe> baseRecipes;
        if (userAllergenIds.isEmpty()) {
            baseRecipes = recipeRepository.findByIsPublishedTrueAndDeletedAtIsNull();
        } else {
            baseRecipes = recipeRepository.findPublishedRecipesExcludingAllergens(userAllergenIds);
        }

        // 3. Get User Favorites for scoring
        Set<Long> savedRecipeIds = savedRecipeRepository.findByUserId(finalUser.getId())
                .stream().map(sr -> sr.getRecipe().getId()).collect(Collectors.toSet());

        // 4. Calculate Scores
        return baseRecipes.stream()
                .map(recipe -> {
                    double score = calculateScore(recipe, finalUser, healthProfileOpt.orElse(null), savedRecipeIds);
                    RecipeResponseDTO dto = recipeMapper.toResponseDTO(recipe);
                    // We could add the score to the DTO if needed, but for now we just use it for sorting
                    return new ScoredRecipe(dto, score);
                })
                .sorted(Comparator.comparingDouble(ScoredRecipe::getScore).reversed())
                .filter(scored -> scored.getScore() > -500) // Exclude hard dietary mismatches
                .map(ScoredRecipe::getDto)
                .filter(dto -> applyFilters(dto, filters))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private double calculateScore(Recipe recipe, User user, UserHealthProfile healthProfile, Set<Long> savedRecipeIds) {
        double score = 0;

        // --- STRICT DIETARY ENFORCEMENT ---
        // If user is Veg/Vegan and recipe is Non-Veg, treat as strict mismatch
        if (user.getDietType() != null && recipe.getDietType() != null) {
            String userDiet = user.getDietType().name();
            String recipeDiet = recipe.getDietType().name();

            // Strict rule: Veg/Vegan users should NOT see Non-Veg recipes in "Recommended"
            if ((userDiet.equals("VEG") || userDiet.equals("VEGAN")) && recipeDiet.equals("NON_VEG")) {
                return -1000; // Hard penalty to push to bottom or filter out
            }

            // Strict rule: Vegan users should only see Vegan recipes (ideally)
            if (userDiet.equals("VEGAN") && !recipeDiet.equals("VEGAN")) {
                score -= 50; // Heavy penalty for non-vegan recipes
            }

            // Diet Match (+20 bonus for exact match)
            if (userDiet.equals(recipeDiet)) {
                score += 20;
            }
        }

        // Health Condition Suitability (+20 for each match)
        if (!user.getHealthConditions().isEmpty()) {
            Set<Long> userDiseaseIds = user.getHealthConditions().stream()
                    .map(Disease::getId).collect(Collectors.toSet());
            
            long matches = recipe.getSafeForDiseases().stream()
                    .filter(d -> userDiseaseIds.contains(d.getId()))
                    .count();
            
            score += (matches * 20);
        }

        // Favorites Bonus (+10)
        if (savedRecipeIds.contains(recipe.getId())) {
            score += 10;
        }

        // Rating Bonus (+5 if high)
        if (recipe.getAverageRating() != null && recipe.getAverageRating() >= 4.0) {
            score += 5;
        }

        // Calorie Alignment (Boost if close to target)
        if (healthProfile != null && healthProfile.getDailyCalorieRequirement() != null && recipe.getNutrition() != null) {
            double targetPerMeal = healthProfile.getDailyCalorieRequirement() / 3;
            double recipeCalories = recipe.getNutrition().getCalories();
            
            if (Math.abs(recipeCalories - targetPerMeal) < (targetPerMeal * 0.2)) {
                score += 15;
            }
        }

        return score;
    }

    private boolean applyFilters(RecipeResponseDTO dto, Map<String, String> filters) {
        if (filters == null || filters.isEmpty()) return true;

        if (filters.containsKey("mealType") && !filters.get("mealType").equalsIgnoreCase(dto.getMealType().name())) {
            return false;
        }
        if (filters.containsKey("dietType") && !filters.get("dietType").equalsIgnoreCase(dto.getDietType().name())) {
            return false;
        }
        // Add more filters as needed (calories range etc)
        return true;
    }

    @lombok.Data
    @RequiredArgsConstructor
    private static class ScoredRecipe {
        private final RecipeResponseDTO dto;
        private final double score;
    }
}
