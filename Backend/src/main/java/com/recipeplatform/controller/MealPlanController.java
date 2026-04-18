package com.recipeplatform.controller;

import com.recipeplatform.domain.User;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.meal.*;
import com.recipeplatform.service.MealPlanService;
import com.recipeplatform.util.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/meal-planner")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;
    private final CurrentUser currentUser;

    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<MealPlanResponseDTO>> createPlan(@RequestBody Map<String, String> request) {
        User user = currentUser.getCurrentUser();
        String name = request.get("name");
        String description = request.get("description");
        String goal = request.get("goal");
        MealPlanResponseDTO plan = mealPlanService.createPlan(user.getId(), name, description, goal);
        return ResponseEntity.ok(ApiResponse.success("Meal plan created successfully", plan));
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<MealPlanResponseDTO>>> getUserPlans() {
        User user = currentUser.getCurrentUser();
        List<MealPlanResponseDTO> plans = mealPlanService.getUserPlans(user.getId());
        return ResponseEntity.ok(ApiResponse.success("User plans retrieved successfully", plans));
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<MealPlanResponseDTO>> getPlan(@PathVariable Long id) {
        MealPlanResponseDTO plan = mealPlanService.getPlanById(id);
        return ResponseEntity.ok(ApiResponse.success("Meal plan retrieved successfully", plan));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        User user = currentUser.getCurrentUser();
        mealPlanService.deletePlan(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Meal plan deleted successfully", null));
    }

    @PostMapping("/plans/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activatePlan(@PathVariable Long id) {
        User user = currentUser.getCurrentUser();
        mealPlanService.activatePlan(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Meal plan activated successfully", null));
    }

    @PostMapping("/plans/{planId}/meals")
    public ResponseEntity<ApiResponse<MealPlanResponseDTO>> addMeal(
            @PathVariable Long planId,
            @RequestBody AddMealToSlotRequest request) {
        User user = currentUser.getCurrentUser();
        MealPlanResponseDTO plan = mealPlanService.addMealToSlot(
                user.getId(), 
                planId, 
                DayOfWeek.valueOf(request.getDayOfWeek()), 
                MealType.valueOf(request.getMealType()), 
                request.getRecipeId()
        );
        return ResponseEntity.ok(ApiResponse.success("Meal added to plan", plan));
    }

    @DeleteMapping("/meals/{slotId}")
    public ResponseEntity<ApiResponse<Void>> removeMeal(@PathVariable Long slotId) {
        User user = currentUser.getCurrentUser();
        mealPlanService.removeMealFromSlot(user.getId(), slotId);
        return ResponseEntity.ok(ApiResponse.success("Meal removed from plan", null));
    }

    @PostMapping("/plans/{planId}/days/{dayOfWeek}/auto-fill")
    public ResponseEntity<ApiResponse<MealPlanResponseDTO>> autoFillDay(
            @PathVariable Long planId,
            @PathVariable String dayOfWeek) {
        User user = currentUser.getCurrentUser();
        MealPlanResponseDTO plan = mealPlanService.autoFillDay(
                user.getId(), 
                planId, 
                java.time.DayOfWeek.valueOf(dayOfWeek.toUpperCase())
        );
        return ResponseEntity.ok(ApiResponse.success("Day auto-filled successfully", plan));
    }

    // Helper DTO for internal request parsing
    @lombok.Data
    public static class AddMealToSlotRequest {
        private String dayOfWeek;
        private String mealType;
        private Long recipeId;
    }
}
