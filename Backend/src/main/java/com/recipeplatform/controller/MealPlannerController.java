package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.planner.MealPlanDetailsDTO;
import com.recipeplatform.dto.planner.MealPlannerRequestDTO;
import com.recipeplatform.dto.planner.MealPlannerResponseDTO;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.service.MealPlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/meal-planner")
@RequiredArgsConstructor
public class MealPlannerController {

    private final MealPlannerService mealPlannerService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<MealPlannerResponseDTO>> addMeal(@RequestBody MealPlannerRequestDTO request) {
        Long userId = getCurrentUserId();
        MealPlannerResponseDTO response = mealPlannerService.addMealToPlanner(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Meal added to planner", response));
    }

    @GetMapping("/plan/{id}")
    public ResponseEntity<ApiResponse<List<MealPlannerResponseDTO>>> getMealPlanner(@PathVariable Long id) {
        List<MealPlannerResponseDTO> response = mealPlannerService.getMealPlanner(id);
        return ResponseEntity.ok(ApiResponse.success("Meal planner retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeMeal(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        mealPlannerService.removeMealFromPlanner(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Meal removed from planner successfully", null));
    }

    // Plan Management Endpoints

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<MealPlanDetailsDTO>>> getUserPlans() {
        Long userId = getCurrentUserId();
        List<MealPlanDetailsDTO> plans = mealPlannerService.getPlansForUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User plans retrieved successfully", plans));
    }

    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<MealPlanDetailsDTO>> createPlan(@RequestBody Map<String, String> request) {
        Long userId = getCurrentUserId();
        String name = request.get("name");
        String description = request.get("description");
        MealPlanDetailsDTO plan = mealPlannerService.createPlan(userId, name, description);
        return ResponseEntity.ok(ApiResponse.success("Meal plan created successfully", plan));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        mealPlannerService.deletePlan(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Meal plan deleted successfully", null));
    }

    private Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
