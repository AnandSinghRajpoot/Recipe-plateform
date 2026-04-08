package com.recipeplatform.dto.recipeIngredient;

import com.recipeplatform.domain.enums.MeasureUnit;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredientResponseDto {
    private Long id;
    private String name;
    private Double quantity;
    private MeasureUnit unit;
}
