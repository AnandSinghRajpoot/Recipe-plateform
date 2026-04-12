package com.recipeplatform.dto.meal;

import com.recipeplatform.domain.enums.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlanResponseDTO {
    private Long id;
    private Long recipeId;
    private String recipeTitle;
    private String recipeImage;
    private Double calories;
    private Double protein;
    private Double carbs;
    private Double fat;
    private LocalDate mealDate;
    private MealType mealType;
}
