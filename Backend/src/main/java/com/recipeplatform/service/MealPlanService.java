package com.recipeplatform.service;

import com.recipeplatform.dto.meal.*;
import java.time.LocalDate;
import java.util.Map;

public interface MealPlanService {
    MealPlanResponseDTO addMeal(MealPlanRequestDTO request);
    void removeMeal(Long id);
    Map<LocalDate, DailyNutrientSummaryDTO> getWeeklyPlan(LocalDate startDate);
    DailyNutrientSummaryDTO getDailySummary(LocalDate date);
}
