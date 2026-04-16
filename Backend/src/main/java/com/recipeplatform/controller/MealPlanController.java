package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.meal.*;
import com.recipeplatform.service.MealPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/meal-plans")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @PostMapping
    public ResponseEntity<ApiResponse<MealPlanResponseDTO>> addMeal(@Valid @RequestBody MealPlanRequestDTO request) {
        MealPlanResponseDTO response = mealPlanService.addMeal(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("Meal added to plan", response, HttpStatus.CREATED.value()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeMeal(@PathVariable Long id) {
        mealPlanService.removeMeal(id);
        return ResponseEntity.ok(new ApiResponse<>("Meal removed from plan", null, HttpStatus.OK.value()));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<Map<LocalDate, DailyNutrientSummaryDTO>>> getWeeklyPlan(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        Map<LocalDate, DailyNutrientSummaryDTO> plan = mealPlanService.getWeeklyPlan(startDate);
        return ResponseEntity.ok(new ApiResponse<>("Weekly plan retrieved", plan, HttpStatus.OK.value()));
    }

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DailyNutrientSummaryDTO>> getDailySummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailyNutrientSummaryDTO summary = mealPlanService.getDailySummary(date);
        return ResponseEntity.ok(new ApiResponse<>("Daily summary retrieved", summary, HttpStatus.OK.value()));
    }
}
