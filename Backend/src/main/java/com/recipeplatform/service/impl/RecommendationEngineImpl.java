package com.recipeplatform.service.impl;

import com.recipeplatform.config.RecommendationConfig;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeIngredient;
import com.recipeplatform.domain.User;
import com.recipeplatform.domain.enums.RestrictionSeverity;
import com.recipeplatform.dto.RecipeRecommendationDTO;
import com.recipeplatform.dto.UserRestrictionsDTO;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.service.RecommendationEngine;
import com.recipeplatform.service.RestrictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RecommendationEngineImpl implements RecommendationEngine {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final RestrictionService restrictionService;
    private final RecommendationConfig config;

    @Override
    public List<RecipeRecommendationDTO> getRecommendations(Long userId, int limit) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Step 1: Get user restrictions
        UserRestrictionsDTO restrictions = restrictionService.getAllRestrictionsForUser(userId);

        // Step 2: Apply hard filter (exclude recipes with allergen ingredients)
        List<Recipe> candidateRecipes;
        if (!restrictions.getHardRestrictedIngredientIds().isEmpty()) {
            candidateRecipes = recipeRepository.findRecipesNotContainingIngredients(
                    restrictions.getHardRestrictedIngredientIds());
        } else {
            candidateRecipes = recipeRepository.findAll();
        }

        log.info("Found {} candidate recipes after hard filtering for user {}",
                candidateRecipes.size(), userId);

        // Step 3: Score and apply soft filters
        List<RecipeRecommendationDTO> recommendations = candidateRecipes.stream()
                .map(recipe -> scoreRecipe(recipe, user, restrictions))
                .sorted(Comparator.comparingDouble(RecipeRecommendationDTO::getScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        log.info("Generated {} recommendations for user {}", recommendations.size(), userId);

        return recommendations;
    }

    private RecipeRecommendationDTO scoreRecipe(Recipe recipe, User user, UserRestrictionsDTO restrictions) {
        double score = 0.0;
        List<String> matchReasons = new ArrayList<>();

        // Base score
        score += 50.0;

        // 1. Diet preference match
        if (user.getDietType() != null && recipe.getTitle() != null) {
            // This is a simplified check - in production, you'd have a proper diet type
            // field on Recipe
            boolean dietMatch = checkDietMatch(recipe, user.getDietType().name());
            if (dietMatch) {
                score += config.getDietMatchScore();
                matchReasons.add("Matches your " + user.getDietType().name() + " diet preference");
            }
        }

        // 2. Nutritional compatibility
        if (recipe.getSugar() != null && recipe.getSugar() < config.getLowSugarThreshold()) {
            score += config.getLowSugarScore();
            matchReasons.add("Low in sugar (" + recipe.getSugar() + "g)");
        }

        if (recipe.getSodium() != null && recipe.getSodium() < config.getLowSodiumThreshold()) {
            score += config.getLowSodiumScore();
            matchReasons.add("Low in sodium (" + recipe.getSodium() + "mg)");
        }

        if (recipe.getFiber() != null && recipe.getFiber() >= config.getHighFiberThreshold()) {
            score += config.getHighFiberScore();
            matchReasons.add("High in fiber (" + recipe.getFiber() + "g)");
        }

        if (recipe.getProtein() != null && recipe.getProtein() >= config.getHighProteinThreshold()) {
            score += config.getHighProteinScore();
            matchReasons.add("High in protein (" + recipe.getProtein() + "g)");
        }

        // 3. Apply soft restriction penalties
        for (UserRestrictionsDTO.SoftRestriction softRestriction : restrictions.getSoftRestrictions()) {
            boolean containsRestrictedIngredient = recipe.getIngredients().stream()
                    .anyMatch(ri -> ri.getIngredient().getId().equals(softRestriction.getIngredientId()));

            if (containsRestrictedIngredient) {
                int penalty = getPenaltyForSeverity(softRestriction.getSeverity());
                score += penalty;
                matchReasons.add("Contains " + softRestriction.getIngredientName() +
                        " (restricted due to health condition)");
            }
        }

        // Build DTO
        return RecipeRecommendationDTO.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .cuisine(recipe.getCuisine())
                .prepTime(recipe.getPrepTime())
                .cookTime(recipe.getCookTime())
                .coverImageUrl(recipe.getCoverImageUrl())
                .calories(recipe.getCalories())
                .protein(recipe.getProtein())
                .carbs(recipe.getCarbs())
                .fat(recipe.getFat())
                .fiber(recipe.getFiber())
                .sugar(recipe.getSugar())
                .sodium(recipe.getSodium())
                .score(score)
                .matchReasons(matchReasons)
                .build();
    }

    private boolean checkDietMatch(Recipe recipe, String dietType) {
        // Simplified diet matching - in production, Recipe should have a dietType field
        // For now, we'll return true as a placeholder
        // You can enhance this by adding a dietType field to Recipe entity
        return true;
    }

    private int getPenaltyForSeverity(RestrictionSeverity severity) {
        return switch (severity) {
            case AVOID -> config.getAvoidPenalty();
            case LIMIT -> config.getLimitPenalty();
            case ELIMINATE -> config.getEliminatePenalty();
        };
    }
}
