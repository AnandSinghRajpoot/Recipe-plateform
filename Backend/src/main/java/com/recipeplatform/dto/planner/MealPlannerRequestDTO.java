package com.recipeplatform.dto.planner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlannerRequestDTO {
    private Long planId;
    private Long recipeId;
    private java.time.DayOfWeek dayOfWeek;
    private com.recipeplatform.domain.enums.MealType mealType;
}
