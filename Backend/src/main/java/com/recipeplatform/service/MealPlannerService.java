package com.recipeplatform.service;

import com.recipeplatform.dto.planner.MealPlanDetailsDTO;
import com.recipeplatform.dto.planner.MealPlannerRequestDTO;
import com.recipeplatform.dto.planner.MealPlannerResponseDTO;

import java.util.List;

public interface MealPlannerService {
    MealPlannerResponseDTO addMealToPlanner(Long userId, MealPlannerRequestDTO request);
    List<MealPlannerResponseDTO> getMealPlanner(Long planId);
    void removeMealFromPlanner(Long userId, Long mealPlannerItemId);
    
    MealPlanDetailsDTO createPlan(Long userId, String name, String description);
    List<MealPlanDetailsDTO> getPlansForUser(Long userId);
    void deletePlan(Long userId, Long planId);
}
