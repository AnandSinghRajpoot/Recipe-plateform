package com.recipeplatform.service;

import com.recipeplatform.dto.meal.*;
import java.util.List;

public interface MealPlanService {
    MealPlanResponseDTO createPlan(Long userId, String name, String description, String goal);
    MealPlanResponseDTO getPlanById(Long planId);
    List<MealPlanResponseDTO> getUserPlans(Long userId);
    void deletePlan(Long userId, Long planId);
    void activatePlan(Long userId, Long planId);
    
    MealPlanResponseDTO addMealToSlot(Long userId, Long planId, java.time.DayOfWeek day, com.recipeplatform.domain.enums.MealType mealType, Long recipeId);
    void removeMealFromSlot(Long userId, Long slotId);
    MealPlanResponseDTO autoFillDay(Long userId, Long planId, java.time.DayOfWeek day);
}
