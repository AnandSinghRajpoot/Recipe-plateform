package com.recipeplatform.dto.recipe;

import com.recipeplatform.domain.enums.CuisineType;
import com.recipeplatform.domain.enums.Difficulty;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.recipeIngredient.RecipeIngredientRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeRequestDto {

    @NotBlank(message = "Recipe title is required")
    @Size(min = 3, max = 120, message = "Recipe title must be between 3 and 120 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 500, message = "Description must be between 20 and 500 characters")
    private String description;

    @NotBlank(message = "Instructions are required")
    @Size(min = 30, max = 2000, message = "instructions must be between 30 and 2000 characters")
    private String instructions;

    private Difficulty difficulty;

    @Min(value = 0, message = "Prep time cannot be negative")
    @Max(value = 180, message = "Prep time cannot exceed 180 minutes")
    @NotNull(message = "Prep time is required")
    private Integer prepTime;

    @Min(value = 1, message = "Cook time must be at least 1 minute")
    @Max(value = 240, message = "Cook time cannot exceed 240 minutes")
    @NotNull(message = "Cook time is required")
    private Integer cookTime;

    private Integer servings = 2;

    @Valid
    private List<RecipeIngredientRequest> ingredients;

    // Dietary classification
    private DietType dietType;
    private MealType mealType;
    private CuisineType cuisineType;

    // Nutritional info
    private NutritionDTO nutrition;

    // Health tagging — IDs of allergens this recipe contains
    private Set<Long> allergenIds;

    // IDs of diseases this recipe is safe for
    private Set<Long> safeForDiseaseIds;
}
