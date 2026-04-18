package com.recipeplatform.dto.recipe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionDTO {
    private Double calories;
    private Double protein;
    private Double carbs;
    private Double fat;
}
