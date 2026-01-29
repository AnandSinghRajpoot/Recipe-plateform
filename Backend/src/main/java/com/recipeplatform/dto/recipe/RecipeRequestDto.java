package com.recipeplatform.dto.recipe;

import com.recipeplatform.domain.enums.Difficulty;
import com.recipeplatform.dto.recipeIngredient.RecipeIngredientRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeRequestDto {

    @NotBlank(message = "Recipe title is required")
    @Size(min = 3, max = 100, message = "Recipe title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 500, message = "Description must be between 20 and 500 characters")
    private String description;

    @NotBlank(message = "Instructions are required")
    @Size(min = 30, max = 2000, message = "instructions must be between 30 and 2000 characters")
    private String instructions;

    @NotNull(message = "Difficulty level is required")
    private Difficulty difficulty;

    @Min(value = 0, message = "Prep time cannot be negative")
    @Max(value = 180, message = "Prep time cannot exceed 180 minutes")
    @NotNull(message = "Prep time is required")
    private Integer prepTime;

    @Min(value = 1, message = "Cook time must be at least 1 minute")
    @Max(value = 240, message = "Cook time cannot exceed 240 minutes")
    @NotNull(message = "Cook time is required")
    private Integer cookTime;

    @NotEmpty(message = "At least one ingredient is required")
    @Valid
    private List<RecipeIngredientRequest> ingredients;
}
