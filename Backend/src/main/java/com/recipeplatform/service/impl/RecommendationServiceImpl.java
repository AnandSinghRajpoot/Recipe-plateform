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
                    List<String> reasons = new ArrayList<>();
                    double score = calculateScore(recipe, finalUser, healthProfileOpt.orElse(null), 
                                               savedRecipeIds, restrictedIngredients, allergicIngredientIds, activeAllergyNames, reasons);
                    RecipeResponseDTO dto = recipeMapper.toResponseDTO(recipe);
                    dto.setMatchScore(score);
                    dto.setMatchReasons(reasons);
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
                                  Set<Long> allergicIngredientIds, Set<String> activeAllergyNames,
                                  List<String> reasons) {
        double score = 0;

        // --- 1. STRICT DIETARY ENFORCEMENT (VEG/VEGAN) ---
        if (user.getDietType() != null && recipe.getDietType() != null) {
            String userDiet = user.getDietType().name();
            String recipeDiet = recipe.getDietType().name();

            if ((userDiet.equals("VEG") || userDiet.equals("VEGAN")) && recipeDiet.equals("NON_VEG")) {
                reasons.add("Excluded: Contains Non-Veg ingredients");
                return -2000; // Total incompatibility
            }

            if (userDiet.equals("VEGAN") && !recipeDiet.equals("VEGAN")) {
                reasons.add("Excluded: Not strictly Vegan");
                return -2000; // Strict vegan enforcement
            }

            if (userDiet.equals(recipeDiet)) {
                score += 30; // Match bonus
                reasons.add("Matches your diet preference (" + userDiet + ")");
            }
        }

        // --- 2. OBJECTIVE HEALTH SUITABILITY (INGREDIENT SCAN) ---
        // We scan ACTUAL recipe ingredients against User's medical data (Allergies + Restrictions)
        for (RecipeIngredient ri : recipe.getIngredients()) {
            Long ingredientId = ri.getIngredient().getId();
            
            // A. Hard Allergen Check (Highest Priority)
            if (allergicIngredientIds.contains(ingredientId)) {
                reasons.add("Excluded: Contains " + ri.getIngredient().getName() + " (Allergen)");
                return -10000; // Total medical exclusion
            }

            // B. Keyword Fail-safe for critical allergens
            String name = ri.getIngredient().getName().toLowerCase();
            
            // Check for Eggs
            boolean hasEggAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("EGG"));
            if (hasEggAllergy && ((name.contains("egg") && !name.contains("eggplant")) || name.contains("mayo"))) {
                reasons.add("Excluded: Contains Egg-based ingredients");
                return -10000;
            }

            // Check for Dairy
            boolean hasDairyAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("DAIRY") || a.contains("MILK"));
            if (hasDairyAllergy && (name.contains("milk") || name.contains("butter") || name.contains("cheese") || name.contains("cream") || name.contains("yogurt") || name.contains("paneer") || name.contains("ghee"))) {
                reasons.add("Excluded: Contains Dairy-based ingredients");
                return -10000;
            }

            // Check for Wheat/Gluten
            boolean hasGlutenAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("GLUTEN") || a.contains("WHEAT"));
            if (hasGlutenAllergy && (name.contains("flour") || name.contains("wheat") || name.contains("maida") || name.contains("semolina") || name.contains("bread") || name.contains("pasta"))) {
                reasons.add("Excluded: Contains Gluten/Wheat ingredients");
                return -10000;
            }
            
            // Check for Fish
            boolean hasFishAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("FISH"));
            if (hasFishAllergy && (name.contains("fish") || name.contains("salmon") || name.contains("tuna") || name.contains("cod") || name.contains("tilapia") || name.contains("trout"))) {
                reasons.add("Excluded: Contains Fish");
                return -10000;
            }

            // Check for Shellfish
            boolean hasShellfishAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("SHELLFISH"));
            if (hasShellfishAllergy && (name.contains("shrimp") || name.contains("crab") || name.contains("lobster") || name.contains("prawn") || name.contains("scallop") || name.contains("oyster") || name.contains("mussel") || name.contains("clam"))) {
                reasons.add("Excluded: Contains Shellfish");
                return -10000;
            }

            // Check for Peanuts & Tree Nuts
            boolean hasNutAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("NUT") || a.contains("PEANUT"));
            if (hasNutAllergy && (name.contains("peanut") || name.contains("almond") || name.contains("walnut") || name.contains("pecan") || name.contains("cashew") || name.contains("pistachio") || name.contains("macadamia"))) {
                reasons.add("Excluded: Contains Nuts/Peanuts");
                return -10000;
            }

            // Check for Soy
            boolean hasSoyAllergy = activeAllergyNames.stream().anyMatch(a -> a.contains("SOY"));
            if (hasSoyAllergy && (name.contains("soy") || name.contains("tofu") || name.contains("edamame") || name.contains("tempeh") || name.contains("miso"))) {
                reasons.add("Excluded: Contains Soy-based ingredients");
                return -10000;
            }

            // C. Disease Restriction Check
            if (restrictedIngredients.containsKey(ingredientId)) {
                RestrictionSeverity severity = restrictedIngredients.get(ingredientId);
                switch (severity) {
                    case ELIMINATE:
                        reasons.add("Critical: Contains " + ri.getIngredient().getName() + " (Medical Restriction)");
                        return -5000; // Medical danger: Exclude entirely
                    case AVOID:
                        score -= 150; // Heavy penalty
                        reasons.add("Penalty: Contains " + ri.getIngredient().getName() + " (Medical Avoidance)");
                        break;
                    case LIMIT:
                        score -= 50;  // Moderate penalty
                        reasons.add("Note: Limited " + ri.getIngredient().getName() + " (Medical Guideline)");
                        break;
                }
            }
        }

        // --- 3. MEDICAL NUTRITIONAL ALIGNMENT (Data-Driven Scanning) ---
        // Instead of hardcoding conditions, we iterate through the user's conditions and apply their specific nutritional profiles
        if (healthProfile != null && recipe.getNutrition() != null) {
            Nutrition n = recipe.getNutrition();
            
            for (UserDisease ud : healthProfile.getDiseases()) {
                Disease d = ud.getDisease();
                
                // Max Constraints
                if (d.getMaxSugar() != null && n.getSugar() != null && n.getSugar() > d.getMaxSugar()) {
                    score -= 100;
                    reasons.add("High sugar for " + d.getName());
                }
                if (d.getMaxSodium() != null && n.getSodium() != null && n.getSodium() > d.getMaxSodium()) {
                    score -= 150;
                    reasons.add("High sodium for " + d.getName());
                }
                if (d.getMaxFat() != null && n.getFat() != null && n.getFat() > d.getMaxFat()) {
                    score -= 100;
                    reasons.add("High fat for " + d.getName());
                }
                
                // Min Constraints (Bonuses)
                if (d.getMinFiber() != null && n.getFiber() != null && n.getFiber() >= d.getMinFiber()) {
                    score += 40;
                    reasons.add("Good source of fiber for " + d.getName());
                }
                if (d.getMinProtein() != null && n.getProtein() != null && n.getProtein() >= d.getMinProtein()) {
                    score += 40;
                    reasons.add("High protein for " + d.getName());
                }
            }
        }

        // --- 4. LIFESTYLE & HABIT ALIGNMENT ---
        if (healthProfile != null) {
            // Activity Level & Work Type Calorie Tolerance
            boolean isSedentary = healthProfile.getActivityLevel() == com.recipeplatform.domain.enums.ActivityLevel.SEDENTARY;
            boolean isSittingJob = healthProfile.getWorkType() == com.recipeplatform.domain.enums.WorkType.SITTING;
            
            if (isSedentary && isSittingJob && recipe.getNutrition() != null) {
                if (recipe.getNutrition().getCalories() != null && recipe.getNutrition().getCalories() > 500) {
                    score -= 60;
                    reasons.add("Slightly high calories for your activity level");
                }
            } else if (healthProfile.getActivityLevel() == com.recipeplatform.domain.enums.ActivityLevel.VERY_ACTIVE) {
                if (recipe.getNutrition() != null && recipe.getNutrition().getProtein() != null && recipe.getNutrition().getProtein() > 25) {
                    score += 40;
                    reasons.add("Great protein boost for your active lifestyle");
                }
            }

            // Habits (Smoking/Alcohol) -> Focus on Antioxidants (Vitamins proxy via ingredients or simple bonus)
            // Note: Since we don't have micronutrients in DB for most, we use a general bonus for "Healthy" categories
            if (healthProfile.getSmokingHabit() != com.recipeplatform.domain.enums.HabitStatus.NONE || 
                healthProfile.getAlcoholHabit() != com.recipeplatform.domain.enums.HabitStatus.NONE) {
                // Indirect bonus for high-fiber, low-fat "clean" recipes
                if (recipe.getNutrition() != null && recipe.getNutrition().getFiber() != null && recipe.getNutrition().getFiber() > 5) {
                    score += 20;
                    reasons.add("Rich in fiber to support your clean habits");
                }
            }

            // Eating Pattern (On-the-go)
            if (healthProfile.getEatingPattern() == com.recipeplatform.domain.enums.EatingPattern.IRREGULAR_MEALS) {
                int totalTime = (recipe.getPrepTime() != null ? recipe.getPrepTime() : 0) + (recipe.getCookTime() != null ? recipe.getCookTime() : 0);
                if (totalTime <= 30) {
                    score += 60;
                    reasons.add("Quick and easy for your busy schedule");
                }
                if (totalTime > 60) score -= 40;  
            }
        }

        // --- 5. COOKING SKILL MATCHING ---
        if (user.getSkillLevel() != null && recipe.getDifficulty() != null) {
            String userSkill = user.getSkillLevel().name();
            String recipeDiff = recipe.getDifficulty().name();
            
            if (userSkill.equals("BEGINNER")) {
                if (recipeDiff.equals("EASY")) {
                    score += 40;
                    reasons.add("Matches your beginner skill level");
                }
                if (recipeDiff.equals("HARD")) score -= 100;
            } else if (userSkill.equals("EXPERT")) {
                if (recipeDiff.equals("HARD")) {
                    score += 30;
                    reasons.add("A good challenge for your expert skills");
                }
                if (recipeDiff.equals("EASY")) score -= 10;  
            } else { // Intermediate
                if (recipeDiff.equals("MEDIUM")) {
                    score += 30;
                    reasons.add("Perfect for your intermediate skills");
                }
            }
        }

        // --- 6. ENGAGEMENT & SAVES ---
        if (savedRecipeIds.contains(recipe.getId())) {
            score += 50; 
            reasons.add("In your saved recipes");
        }

        if (recipe.getAverageRating() != null && recipe.getAverageRating() >= 4.0) {
            score += 20;
            reasons.add("Highly rated by the community");
        }

        // --- 7. CALORIE BALANCING (DAILY TARGET ALIGNMENT) ---
        if (healthProfile != null && healthProfile.getDailyCalorieRequirement() != null && recipe.getNutrition() != null && recipe.getNutrition().getCalories() != null) {
            double targetPerMeal = healthProfile.getDailyCalorieRequirement() / 3;
            double recipeCalories = recipe.getNutrition().getCalories();
            
            double deviation = Math.abs(recipeCalories - targetPerMeal);
            double tolerance = targetPerMeal * 0.15;
            
            if (deviation < tolerance) {
                score += 50; // Precision bonus
                reasons.add("Perfectly aligns with your caloric goals");
            } else if (deviation < (targetPerMeal * 0.3)) {
                score += 20;
            } else if (deviation > (targetPerMeal * 0.5)) {
                score -= 40; // Significant caloric mismatch
                reasons.add("Calorie count is slightly outside your target range");
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
