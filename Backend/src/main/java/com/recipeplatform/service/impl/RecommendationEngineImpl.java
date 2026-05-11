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
import com.recipeplatform.dto.recipe.NutritionDTO;
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
        Set<String> activeAllergyNames = new java.util.HashSet<>();
        Set<Long> userDiseaseIds = Set.of();
        double targetCalories = 600.0; // Default fallback per meal

        if (profile != null) {
            userAllergyIds = profile.getAllergies().stream()
                    .map(ua -> ua.getAllergy().getId())
                    .collect(Collectors.toSet());

            for (UserAllergy ua : profile.getAllergies()) {
                activeAllergyNames.add(ua.getAllergy().getName().toUpperCase());
            }

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
            candidateRecipes = recipeRepository.findByIsPublishedTrueAndDeletedAtIsNullAndIsModeratedFalse();
        }

        log.info("Phase 1 complete: Found {} safe candidate recipes for user {} (Excluded {} allergens)",
                candidateRecipes.size(), userId, userAllergyIds.size());

        final Set<Long> finalDiseaseIds = userDiseaseIds;
        final double finalTargetCalories = targetCalories;

        // ============================================
        // Phase 2 & 3: Score and Apply Soft Filters & Keyword Fail-safes
        // ============================================
        List<RecipeRecommendationDTO> recommendations = candidateRecipes.stream()
                .map(recipe -> scoreRecipe(recipe, user, finalDiseaseIds, activeAllergyNames, targetMealType, finalTargetCalories))
                .filter(r -> r.getScore() > -500.0) // Exclude hard dietary/allergen mismatches
                .sorted(Comparator.comparingDouble(RecipeRecommendationDTO::getScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        log.info("Phase 3 complete: Generated {} recommendations for user {}", recommendations.size(), userId);
        return recommendations;
    }

    private RecipeRecommendationDTO scoreRecipe(Recipe recipe, User user, Set<Long> userDiseaseIds, Set<String> activeAllergyNames, MealType targetMealType, double targetCalories) {
        double score = 0.0;
        double safetyScore = 100.0;
        List<String> matchReasons = new ArrayList<>();

        // Base score simply for being in the candidate pool safely
        score += 20.0;

        // --- Phase 1.5: Keyword Fail-safes for critical allergens ---
        if (!activeAllergyNames.isEmpty() && recipe.getIngredients() != null) {
            for (com.recipeplatform.domain.RecipeIngredient ri : recipe.getIngredients()) {
                if (ri.getIngredient() == null) continue;
                String name = ri.getIngredient().getName().toLowerCase();
                
                // Check for Eggs
                boolean hasEggAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("EGG"));
                if (hasEggAllergy && ((name.contains("egg") && !name.contains("eggplant")) || name.contains("mayo"))) {
                    matchReasons.add("Excluded: Contains Egg-based ingredients");
                    score -= 10000.0;
                    break;
                }

                // Check for Dairy
                boolean hasDairyAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("DAIRY") || a.contains("MILK"));
                if (hasDairyAllergy && (name.contains("milk") || name.contains("butter") || name.contains("cheese") || name.contains("cream") || name.contains("yogurt") || name.contains("paneer") || name.contains("ghee"))) {
                    matchReasons.add("Excluded: Contains Dairy-based ingredients");
                    score -= 10000.0;
                    break;
                }

                // Check for Wheat/Gluten
                boolean hasGlutenAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("GLUTEN") || a.contains("WHEAT"));
                if (hasGlutenAllergy && (name.contains("flour") || name.contains("wheat") || name.contains("maida") || name.contains("semolina") || name.contains("bread") || name.contains("pasta"))) {
                    matchReasons.add("Excluded: Contains Gluten/Wheat ingredients");
                    score -= 10000.0;
                    break;
                }
                
                // Check for Fish
                boolean hasFishAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("FISH"));
                if (hasFishAllergy && (name.contains("fish") || name.contains("salmon") || name.contains("tuna") || name.contains("cod") || name.contains("tilapia") || name.contains("trout"))) {
                    matchReasons.add("Excluded: Contains Fish");
                    score -= 10000.0;
                    break;
                }

                // Check for Shellfish
                boolean hasShellfishAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("SHELLFISH"));
                if (hasShellfishAllergy && (name.contains("shrimp") || name.contains("crab") || name.contains("lobster") || name.contains("prawn") || name.contains("scallop") || name.contains("oyster") || name.contains("mussel") || name.contains("clam"))) {
                    matchReasons.add("Excluded: Contains Shellfish");
                    score -= 10000.0;
                    break;
                }

                // Check for Peanuts & Tree Nuts
                boolean hasNutAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("NUT") || a.contains("PEANUT"));
                if (hasNutAllergy && (name.contains("peanut") || name.contains("almond") || name.contains("walnut") || name.contains("pecan") || name.contains("cashew") || name.contains("pistachio") || name.contains("macadamia"))) {
                    matchReasons.add("Excluded: Contains Nuts/Peanuts");
                    score -= 10000.0;
                    break;
                }

                // Check for Soy
                boolean hasSoyAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("SOY"));
                if (hasSoyAllergy && (name.contains("soy") || name.contains("tofu") || name.contains("edamame") || name.contains("tempeh") || name.contains("miso"))) {
                    matchReasons.add("Excluded: Contains Soy-based ingredients");
                    score -= 10000.0;
                    break;
                }
            }
        }
        
        // If keyword fail-safe triggered, return immediately
        if (score <= -500.0) {
            return RecipeRecommendationDTO.builder()
                .id(recipe.getId())
                .score(score)
                .build();
        }

        // --- Phase 2: Health Analysis Boosting ---
        boolean isDiseaseVetted = false;
        if (!userDiseaseIds.isEmpty() && recipe.getHealthAnalyses() != null) {
            for (com.recipeplatform.domain.RecipeHealthAnalysis analysis : recipe.getHealthAnalyses()) {
                if (userDiseaseIds.contains(analysis.getDisease().getId())) {
                    if (analysis.getRiskLevel() == com.recipeplatform.domain.enums.RiskLevel.SEVERE || analysis.getRiskLevel() == com.recipeplatform.domain.enums.RiskLevel.HIGH) {
                        score -= 50.0;
                        matchReasons.add("Warning: High risk for your " + analysis.getDisease().getName() + " condition.");
                    } else if (analysis.getRiskLevel() == com.recipeplatform.domain.enums.RiskLevel.LOW) {
                        score += 15.0;
                        isDiseaseVetted = true;
                        matchReasons.add("Highly compatible with your " + analysis.getDisease().getName() + " condition.");
                    } else if (analysis.getRiskLevel() == com.recipeplatform.domain.enums.RiskLevel.MEDIUM) {
                        matchReasons.add("Moderate risk for " + analysis.getDisease().getName() + ".");
                    }
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
        if (recipe.getNutrition() != null && recipe.getNutrition().getCalories() != null) {
            double calDiff = Math.abs(recipe.getNutrition().getCalories() - targetCalories);
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
                .cuisine(recipe.getCuisineType() != null ? recipe.getCuisineType().name() : "INTERNATIONAL")
                .coverImageUrl(recipe.getCoverImageUrl())
                .dietType(recipe.getDietType())
                .mealType(recipe.getMealType())
                .prepTime(recipe.getPrepTime())
                .cookTime(recipe.getCookTime())
                .servings(recipe.getServings())
                .nutrition(recipe.getNutrition() != null ? NutritionDTO.builder()
                        .calories(recipe.getNutrition().getCalories())
                        .protein(recipe.getNutrition().getProtein())
                        .carbs(recipe.getNutrition().getCarbs())
                        .fat(recipe.getNutrition().getFat())
                        .build() : null)
                .score(score)
                .safetyScore(safetyScore)
                .matchReason(primaryReason)
                .matchReasons(matchReasons)
                .build();
    }
}
