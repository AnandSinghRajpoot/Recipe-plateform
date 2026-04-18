package com.recipeplatform.dto;

import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.recipe.NutritionDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeRecommendationDTO {

    private Long id;
    private String title;
    private String description;
    private String cuisine;
    private String coverImageUrl;

    // Classification
    private DietType dietType;
    private MealType mealType;

    // Timing
    private Integer prepTime;
    private Integer cookTime;
    private Integer servings;

    // Nutritional information
    private NutritionDTO nutrition;

    // Recommendation metadata
    private Double score;
    private Double safetyScore;
    private String matchReason;

    @Builder.Default
    private List<String> matchReasons = new ArrayList<>();
}
