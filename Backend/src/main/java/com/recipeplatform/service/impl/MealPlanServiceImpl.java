package com.recipeplatform.service.impl;

import com.recipeplatform.domain.*;
import com.recipeplatform.domain.enums.ActivityLevel;
import com.recipeplatform.domain.enums.Gender;
import com.recipeplatform.dto.meal.*;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.repository.*;
import com.recipeplatform.service.MealPlanService;
import com.recipeplatform.util.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MealPlanServiceImpl implements MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final UserHealthProfileRepository userHealthProfileRepository;
    private final RecipeRepository recipeRepository;
    private final CurrentUser currentUser;

    @Override
    @Transactional
    public MealPlanResponseDTO addMeal(MealPlanRequestDTO request) {
        User user = currentUser.getCurrentUser();
        Recipe recipe = recipeRepository.findById(request.getRecipeId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        MealPlan mealPlan = new MealPlan();
        mealPlan.setUser(user);
        mealPlan.setRecipe(recipe);
        mealPlan.setMealDate(request.getMealDate());
        mealPlan.setMealType(request.getMealType());

        MealPlan saved = mealPlanRepository.save(mealPlan);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void removeMeal(Long id) {
        mealPlanRepository.deleteById(id);
    }

    @Override
    public Map<LocalDate, DailyNutrientSummaryDTO> getWeeklyPlan(LocalDate startDate) {
        User user = currentUser.getCurrentUser();
        LocalDate endDate = startDate.plusDays(6);
        
        List<MealPlan> plans = mealPlanRepository.findByUserAndMealDateBetween(user, startDate, endDate);
        
        Map<LocalDate, List<MealPlan>> groupedByDate = plans.stream()
                .collect(Collectors.groupingBy(MealPlan::getMealDate));

        Map<LocalDate, DailyNutrientSummaryDTO> weeklySummary = new LinkedHashMap<>();
        
        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);
            List<MealPlan> dayPlans = groupedByDate.getOrDefault(date, new ArrayList<>());
            weeklySummary.put(date, calculateDailySummary(user, dayPlans));
        }

        return weeklySummary;
    }

    @Override
    public DailyNutrientSummaryDTO getDailySummary(LocalDate date) {
        User user = currentUser.getCurrentUser();
        List<MealPlan> dayPlans = mealPlanRepository.findByUserAndMealDate(user, date);
        return calculateDailySummary(user, dayPlans);
    }

    private DailyNutrientSummaryDTO calculateDailySummary(User user, List<MealPlan> meals) {
        Optional<UserHealthProfile> profileOpt = userHealthProfileRepository.findByUserId(user.getId());
        
        double targetCals = 2000.0; // Default
        double targetProt = 150.0;
        double targetCarbs = 250.0;
        double targetFat = 70.0;

        if (profileOpt.isPresent()) {
            UserHealthProfile profile = profileOpt.get();
            targetCals = calculateTDEE(profile);
            // Macro targets based on common ratios (30/45/25)
            targetProt = (targetCals * 0.30) / 4;
            targetCarbs = (targetCals * 0.45) / 4;
            targetFat = (targetCals * 0.25) / 9;
        }

        double plannedCals = meals.stream().mapToDouble(m -> m.getRecipe().getCalories() != null ? m.getRecipe().getCalories() : 0).sum();
        double plannedProt = meals.stream().mapToDouble(m -> m.getRecipe().getProtein() != null ? m.getRecipe().getProtein() : 0).sum();
        double plannedCarbs = meals.stream().mapToDouble(m -> m.getRecipe().getCarbs() != null ? m.getRecipe().getCarbs() : 0).sum();
        double plannedFat = meals.stream().mapToDouble(m -> m.getRecipe().getFat() != null ? m.getRecipe().getFat() : 0).sum();

        String status = "Balanced";
        if (plannedCals > targetCals + 100) status = "Over";
        else if (plannedCals < targetCals - 100) status = "Under";

        return DailyNutrientSummaryDTO.builder()
                .targetCalories(targetCals)
                .plannedCalories(plannedCals)
                .targetProtein(targetProt)
                .plannedProtein(plannedProt)
                .targetCarbs(targetCarbs)
                .plannedCarbs(plannedCarbs)
                .targetFat(targetFat)
                .plannedFat(plannedFat)
                .status(status)
                .meals(meals.stream().map(this::mapToDTO).collect(Collectors.toList()))
                .build();
    }

    private double calculateTDEE(UserHealthProfile profile) {
        if (profile.getWeight() == null || profile.getHeight() == null || profile.getAge() == null) return 2000.0;
        
        double bmr;
        if (profile.getGender() == Gender.MALE) {
            bmr = (10 * profile.getWeight()) + (6.25 * profile.getHeight()) - (5 * profile.getAge()) + 5;
        } else {
            bmr = (10 * profile.getWeight()) + (6.25 * profile.getHeight()) - (5 * profile.getAge()) - 161;
        }

        double multiplier = 1.2;
        if (profile.getActivityLevel() == ActivityLevel.LIGHTLY_ACTIVE) multiplier = 1.375;
        else if (profile.getActivityLevel() == ActivityLevel.MODERATELY_ACTIVE) multiplier = 1.55;
        else if (profile.getActivityLevel() == ActivityLevel.VERY_ACTIVE) multiplier = 1.725;
        else if (profile.getActivityLevel() == ActivityLevel.EXTREMELY_ACTIVE) multiplier = 1.9;

        return bmr * multiplier;
    }

    private MealPlanResponseDTO mapToDTO(MealPlan meal) {
        return MealPlanResponseDTO.builder()
                .id(meal.getId())
                .recipeId(meal.getRecipe().getId())
                .recipeTitle(meal.getRecipe().getTitle())
                .recipeImage(meal.getRecipe().getCoverImageUrl())
                .calories(meal.getRecipe().getCalories())
                .protein(meal.getRecipe().getProtein())
                .carbs(meal.getRecipe().getCarbs())
                .fat(meal.getRecipe().getFat())
                .mealDate(meal.getMealDate())
                .mealType(meal.getMealType())
                .build();
    }
}
