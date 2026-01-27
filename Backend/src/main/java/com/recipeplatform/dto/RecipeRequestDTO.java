package com.recipeplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeRequestDTO {

    @NotBlank(message = "Recipe name is required")
    @Size(min = 3, max = 100, message = "Recipe name must be between 3 and 100 characters")
    private String name;

    private String description;

    private String thumbnailImage;

    private String instructions;

    private List<IngredientDTO> ingredients;

    private Long categoryId;

    private Integer prepTime;

    private Integer cookTime;

    private Integer servings;

    private String author;
}
