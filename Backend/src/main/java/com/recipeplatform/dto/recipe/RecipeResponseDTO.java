package com.recipeplatform.dto.recipe;

import com.recipeplatform.domain.enums.CuisineType;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.Difficulty;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.AuthorDto;
import com.recipeplatform.dto.CommentResponseDto;
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
    private Difficulty difficulty;

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

    @Builder.Default
    private Long savedCount = 0L;
    @Builder.Default
    private Long likesCount = 0L;
    @Builder.Default
    private Boolean isLiked = false;

    // === Rating Information ===
    @Builder.Default
    private Double averageRating = 0.0;
    @Builder.Default
    private Long reviewCount = 0L;

    private List<CommentResponseDto> comments;
}
