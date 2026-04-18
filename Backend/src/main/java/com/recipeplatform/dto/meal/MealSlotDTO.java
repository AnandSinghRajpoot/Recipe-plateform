package com.recipeplatform.dto.meal;

import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealSlotDTO {
    private Long id;
    private MealType mealType;
    private RecipeResponseDTO recipe;
}
