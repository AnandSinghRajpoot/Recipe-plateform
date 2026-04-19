package com.recipeplatform.service.impl;

import com.recipeplatform.domain.*;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.mapper.RecipeMapper;
import com.recipeplatform.domain.enums.RestrictionSeverity;
import com.recipeplatform.repository.*;
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
    private final DiseaseFoodRestrictionRepository diseaseFoodRestrictionRepository;
    private final UserDiseaseRepository userDiseaseRepository;
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

        // 1. Get Allergic Ingredient IDs for strict objective exclusion
        Set<Long> allergicIngredientIds = new HashSet<>();
        Set<String> activeAllergyNames = new HashSet<>();
        healthProfileOpt.ifPresent(hp -> {
            for (UserAllergy ua : hp.getAllergies()) {
                String name = ua.getAllergy().getName().toUpperCase();
                activeAllergyNames.add(name);
                for (AllergyRestriction ar : ua.getAllergy().getRestrictions()) {
                    allergicIngredientIds.add(ar.getIngredient().getId());
                }
            }
        });

        // 2. Fetch published recipes
        List<Recipe> baseRecipes = recipeRepository.findByIsPublishedTrueAndDeletedAtIsNull();

        // 3. Build User's Ingredient Restriction Profile (OBJECTIVE DATA)
        Map<Long, RestrictionSeverity> restrictedIngredients = new HashMap<>();
        if (healthProfileOpt.isPresent()) {
            List<UserDisease> userDiseases = userDiseaseRepository.findByUserHealthProfileId(healthProfileOpt.get().getId());
            for (UserDisease ud : userDiseases) {
                List<DiseaseFoodRestriction> restrictions;
                if (ud.getStage() != null) {
                    restrictions = diseaseFoodRestrictionRepository.findByDiseaseIdAndStageIdOrStageIsNull(
                            ud.getDisease().getId(), ud.getStage().getId());
                } else {
                    restrictions = diseaseFoodRestrictionRepository.findGeneralRestrictionsByDiseaseId(ud.getDisease().getId());
                }
                
                for (DiseaseFoodRestriction dfr : restrictions) {
                    Long ingredientId = dfr.getIngredient().getId();
                    RestrictionSeverity severity = dfr.getSeverity();
                    // Keep the most severe restriction for an ingredient
                    restrictedIngredients.merge(ingredientId, severity, (oldS, newS) -> 
                        newS.ordinal() > oldS.ordinal() ? newS : oldS);
                }
            }
        }

        // 4. Get User Favorites for scoring
        Set<Long> savedRecipeIds = savedRecipeRepository.findByUserId(finalUser.getId())
                .stream().map(sr -> sr.getRecipe().getId()).collect(Collectors.toSet());

        // 5. Calculate Scores
        return baseRecipes.stream()
                .map(recipe -> {
                    double score = calculateScore(recipe, finalUser, healthProfileOpt.orElse(null), 
                                               savedRecipeIds, restrictedIngredients, allergicIngredientIds, activeAllergyNames);
                    RecipeResponseDTO dto = recipeMapper.toResponseDTO(recipe);
                    return new ScoredRecipe(dto, score);
                })
                .sorted(Comparator.comparingDouble(ScoredRecipe::getScore).reversed())
                .filter(scored -> scored.getScore() > -500) // Exclude hard dietary mismatches
                .map(ScoredRecipe::getDto)
                .filter(dto -> applyFilters(dto, filters))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private double calculateScore(Recipe recipe, User user, UserHealthProfile healthProfile, 
                                  Set<Long> savedRecipeIds, Map<Long, RestrictionSeverity> restrictedIngredients,
                                  Set<Long> allergicIngredientIds, Set<String> activeAllergyNames) {
        double score = 0;

        // --- 1. STRICT DIETARY ENFORCEMENT (VEG/VEGAN) ---
        if (user.getDietType() != null && recipe.getDietType() != null) {
            String userDiet = user.getDietType().name();
            String recipeDiet = recipe.getDietType().name();

            if ((userDiet.equals("VEG") || userDiet.equals("VEGAN")) && recipeDiet.equals("NON_VEG")) {
                return -2000; // Total incompatibility
            }

            if (userDiet.equals("VEGAN") && !recipeDiet.equals("VEGAN")) {
                score -= 100; // Strong penalty
            }

            if (userDiet.equals(recipeDiet)) {
                score += 30; // Match bonus
            }
        }

        // --- 2. OBJECTIVE HEALTH SUITABILITY (INGREDIENT SCAN) ---
        // We scan ACTUAL recipe ingredients against User's medical data (Allergies + Restrictions)
        for (RecipeIngredient ri : recipe.getIngredients()) {
            Long ingredientId = ri.getIngredient().getId();
            
            // A. Hard Allergen Check (Highest Priority)
            if (allergicIngredientIds.contains(ingredientId)) {
                return -10000; // Total medical exclusion
            }

            // B. Keyword Fail-safe for critical allergens
            String name = ri.getIngredient().getName().toLowerCase();
            if (activeAllergyNames.contains("EGGS") && name.contains("egg") && !name.contains("eggplant")) {
                return -10000;
            }
            if (activeAllergyNames.contains("MILK / DAIRY") && (name.contains("milk") || name.contains("butter") || name.contains("cheese") || name.contains("cream"))) {
                return -10000;
            }

            // C. Disease Restriction Check
            if (restrictedIngredients.containsKey(ingredientId)) {
                RestrictionSeverity severity = restrictedIngredients.get(ingredientId);
                switch (severity) {
                    case ELIMINATE:
                        return -5000; // Medical danger: Exclude entirely
                    case AVOID:
                        score -= 150; // Heavy penalty
                        break;
                    case LIMIT:
                        score -= 50;  // Moderate penalty
                        break;
                }
            }
        }

        // --- 3. MEDICAL NUTRITIONAL ALIGNMENT ---
        // Rule-based logic for specific conditions using the Nutrition profile
        if (healthProfile != null && !healthProfile.getDiseases().isEmpty() && recipe.getNutrition() != null) {
            Nutrition n = recipe.getNutrition();
            Set<String> diseaseNames = healthProfile.getDiseases().stream()
                    .map(ud -> ud.getDisease().getName().toUpperCase())
                    .collect(Collectors.toSet());

            // Diabetes Mapping
            if (diseaseNames.contains("DIABETES")) {
                if (n.getSugar() != null && n.getSugar() > 10) score -= 100; // Penalize high sugar
                if (n.getCarbs() != null && n.getCarbs() < 25) score += 40;  // Bonus for low carb
                if (n.getFiber() != null && n.getFiber() > 5) score += 30;   // Bonus for high fiber
            }

            // Hypertension Mapping
            if (diseaseNames.contains("HYPERTENSION") || diseaseNames.contains("HIGH BLOOD PRESSURE")) {
                if (n.getSodium() != null && n.getSodium() > 500) score -= 150; // Penalize high sodium
                if (n.getSodium() != null && n.getSodium() < 140) score += 50;  // Bonus for low sodium
            }
            
            // Obesity Matching
            if (diseaseNames.contains("OBESITY")) {
                if (n.getCalories() != null && n.getCalories() > 600) score -= 100;
                if (n.getCalories() != null && n.getCalories() < 400) score += 40;
            }
        }

        // --- 4. ENGAGEMENT & SAVES ---
        if (savedRecipeIds.contains(recipe.getId())) {
            score += 50; // High bonus for favorites
        }

        if (recipe.getAverageRating() != null && recipe.getAverageRating() >= 4.0) {
            score += 20;
        }

        // --- 5. CALORIE BALANCING (DAILY TARGET ALIGNMENT) ---
        if (healthProfile != null && healthProfile.getDailyCalorieRequirement() != null && recipe.getNutrition() != null) {
            double targetPerMeal = healthProfile.getDailyCalorieRequirement() / 3;
            double recipeCalories = recipe.getNutrition().getCalories();
            
            double deviation = Math.abs(recipeCalories - targetPerMeal);
            if (deviation < (targetPerMeal * 0.15)) {
                score += 40; // High precision match
            } else if (deviation < (targetPerMeal * 0.3)) {
                score += 15; // Moderate match
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
