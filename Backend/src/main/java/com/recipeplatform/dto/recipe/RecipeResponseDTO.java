package com.recipeplatform.dto.recipe;

import com.recipeplatform.domain.enums.CuisineType;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.AuthorDto;
import com.recipeplatform.dto.recipeIngredient.RecipeIngredientResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String coverImageUrl;
    private String instructions;
    private List<RecipeIngredientResponseDto> ingredients;
    private Integer prepTime;
    private Integer cookTime;
    private Integer servings;
    private AuthorDto author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Dietary classification
    private DietType dietType;
    private MealType mealType;
    private CuisineType cuisineType;

    // Health tagging
    private Set<String> containsAllergens;
    private Set<String> safeForDiseases;

    // Nutritional info
    private Double calories;
    private Double protein;
    private Double carbs;
    private Double fat;
    private Double fiber;
    private Double sugar;
    private Double sodium;

    // Publication
    private Boolean isPublished;

    private Long savedCount = 0L;
}
