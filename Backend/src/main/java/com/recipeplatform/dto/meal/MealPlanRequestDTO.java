package com.recipeplatform.dto.meal;

import com.recipeplatform.domain.enums.MealType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MealPlanRequestDTO {
    @NotNull(message = "Recipe ID is required")
    private Long recipeId;
    
    @NotNull(message = "Meal date is required")
    private LocalDate mealDate;
    
    @NotNull(message = "Meal type is required")
    private MealType mealType;
}
