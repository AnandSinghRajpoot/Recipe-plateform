package com.recipeplatform.dto.ingredient;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngredientRequestDto {

    @NotBlank(message = "Ingredient name is required")
    private String name;

}
