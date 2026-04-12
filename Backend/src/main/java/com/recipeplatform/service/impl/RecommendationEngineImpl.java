package com.recipeplatform.service.impl;

import com.recipeplatform.config.RecommendationConfig;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.User;
import com.recipeplatform.domain.UserAllergy;
import com.recipeplatform.domain.UserDisease;
import com.recipeplatform.domain.UserHealthProfile;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.RecipeRecommendationDTO;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.UserHealthProfileRepository;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.service.RecommendationEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RecommendationEngineImpl implements RecommendationEngine {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final UserHealthProfileRepository userHealthProfileRepository;

    @Override
    public List<RecipeRecommendationDTO> getRecommendations(Long userId, int limit) {
        return generateRecommendations(userId, null, limit);
    }

    @Override
    public List<RecipeRecommendationDTO> getByMealType(Long userId, MealType mealType, int limit) {
        return generateRecommendations(userId, mealType, limit);
    }

    private List<RecipeRecommendationDTO> generateRecommendations(Long userId, MealType targetMealType, int limit) {
        // Step 0: Ensure user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Get user health profile to extract exact allergies & diseases
        UserHealthProfile profile = userHealthProfileRepository.findByUserId(userId).orElse(null);

        Set<Long> userAllergyIds = Set.of();
        Set<Long> userDiseaseIds = Set.of();
        double targetCalories = 600.0; // Default fallback per meal

        if (profile != null) {
            userAllergyIds = profile.getAllergies().stream()
                    .map(ua -> ua.getAllergy().getId())
                    .collect(Collectors.toSet());

            userDiseaseIds = profile.getDiseases().stream()
                    .map(ud -> ud.getDisease().getId())
                    .collect(Collectors.toSet());

            if (profile.getDailyCalorieRequirement() != null) {
                targetCalories = profile.getDailyCalorieRequirement() / 3.0; // Assuming 3 meals/day
            }
        }

        // ============================================
        // Phase 1: Hard Filter (Exclude Allergens & Fetch Base List)
        // ============================================
        List<Recipe> candidateRecipes;
        if (!userAllergyIds.isEmpty()) {
            candidateRecipes = recipeRepository.findPublishedRecipesExcludingAllergens(userAllergyIds);
        } else {
            candidateRecipes = recipeRepository.findByIsPublishedTrueAndDeletedAtIsNull();
        }

        log.info("Phase 1 complete: Found {} safe candidate recipes for user {} (Excluded {} allergens)",
                candidateRecipes.size(), userId, userAllergyIds.size());

        final Set<Long> finalDiseaseIds = userDiseaseIds;
        final double finalTargetCalories = targetCalories;

        // ============================================
        // Phase 2 & 3: Score and Apply Soft Filters
        // ============================================
        List<RecipeRecommendationDTO> recommendations = candidateRecipes.stream()
                .map(recipe -> scoreRecipe(recipe, user, finalDiseaseIds, targetMealType, finalTargetCalories))
                .sorted(Comparator.comparingDouble(RecipeRecommendationDTO::getScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        log.info("Phase 3 complete: Generated {} recommendations for user {}", recommendations.size(), userId);
        return recommendations;
    }

    private RecipeRecommendationDTO scoreRecipe(Recipe recipe, User user, Set<Long> userDiseaseIds, MealType targetMealType, double targetCalories) {
        double score = 0.0;
        double safetyScore = 100.0;
        List<String> matchReasons = new ArrayList<>();

        // Base score simply for being in the candidate pool safely
        score += 20.0;

        // --- Phase 2: Disease-Safe Boosting ---
        boolean isDiseaseVetted = false;
        if (!userDiseaseIds.isEmpty() && recipe.getSafeForDiseases() != null) {
            for (Long udId : userDiseaseIds) {
                boolean match = recipe.getSafeForDiseases().stream().anyMatch(d -> d.getId().equals(udId));
                if (match) {
                    score += 15.0; // Disease-safe bonus
                    isDiseaseVetted = true;
                    matchReasons.add("Vetted safe for your health conditions");
                    break;
                }
            }
        }

        // --- Phase 3: Preference Matching ---
        
        // 1. Diet Type Match
        if (user.getDietType() != null && recipe.getDietType() != null) {
            if (user.getDietType() == recipe.getDietType()) {
                score += 40.0;
                matchReasons.add("Matches your " + user.getDietType().name() + " diet");
            }
        }

        // 2. Meal Type Match
        if (targetMealType != null && recipe.getMealType() != null) {
            if (targetMealType == recipe.getMealType()) {
                score += 25.0;
                matchReasons.add("Perfect for " + targetMealType.name());
            }
        }

        // 3. Caloric Match (±15% of target)
        if (recipe.getCalories() != null) {
            double calDiff = Math.abs(recipe.getCalories() - targetCalories);
            double percentageDiff = calDiff / targetCalories;
            if (percentageDiff <= 0.15) {
                score += 20.0;
                matchReasons.add("Hits your caloric goal");
            } else if (percentageDiff <= 0.30) {
                score += 10.0;
            }
        }

        // Safety score adjustments
        if (!isDiseaseVetted && !userDiseaseIds.isEmpty()) {
            safetyScore -= 20.0; // Subtract safety confidence if not explicitly vetted, though still allowed
        }

        // Generate primary match reason
        String primaryReason = matchReasons.isEmpty() ? "Based on popularity" : matchReasons.get(0);

        return RecipeRecommendationDTO.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .cuisine(recipe.getCuisineType() != null ? recipe.getCuisineType().name() : recipe.getCuisine())
                .coverImageUrl(recipe.getCoverImageUrl())
                .dietType(recipe.getDietType())
                .mealType(recipe.getMealType())
                .prepTime(recipe.getPrepTime())
                .cookTime(recipe.getCookTime())
                .servings(recipe.getServings())
                .calories(recipe.getCalories())
                .protein(recipe.getProtein())
                .carbs(recipe.getCarbs())
                .fat(recipe.getFat())
                .fiber(recipe.getFiber())
                .sugar(recipe.getSugar())
                .sodium(recipe.getSodium())
                .score(score)
                .safetyScore(safetyScore)
                .matchReason(primaryReason)
                .matchReasons(matchReasons)
                .build();
    }
}
