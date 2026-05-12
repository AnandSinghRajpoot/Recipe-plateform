package com.recipeplatform.dto.recipe;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionDTO {
    @Min(value = 0, message = "Calories cannot be negative")
    private Double calories;

    @Min(value = 0, message = "Protein cannot be negative")
    private Double protein;

    @Min(value = 0, message = "Carbs cannot be negative")
    private Double carbs;

    @Min(value = 0, message = "Fat cannot be negative")
    private Double fat;
}
