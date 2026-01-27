package com.recipeplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String thumbnailImage;
    private String instructions;
    private List<IngredientDTO> ingredients;
    private CategoryDTO category;
    private Integer prepTime;
    private Integer cookTime;
    private Integer servings;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
