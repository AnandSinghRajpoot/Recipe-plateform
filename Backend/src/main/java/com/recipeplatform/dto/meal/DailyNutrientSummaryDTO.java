package com.recipeplatform.dto.meal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyNutrientSummaryDTO {
    private Double targetCalories;
    private Double plannedCalories;
    private Double targetProtein;
    private Double plannedProtein;
    private Double targetCarbs;
    private Double plannedCarbs;
    private Double targetFat;
    private Double plannedFat;
    private String status; // Balanced, Under, Over
    private List<MealPlanResponseDTO> meals;
}
