package com.recipeplatform.dto.planner;

import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlannerResponseDTO {
    private Long id;
    private java.time.DayOfWeek dayOfWeek;
    private com.recipeplatform.domain.enums.MealType mealType;
    private RecipeResponseDTO recipe;
}
