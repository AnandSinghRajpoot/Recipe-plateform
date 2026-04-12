package com.recipeplatform.dto;

import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.MealType;
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
    private Double calories;
    private Double protein;
    private Double carbs;
    private Double fat;
    private Double fiber;
    private Double sugar;
    private Double sodium;

    // Recommendation metadata
    private Double score;
    private Double safetyScore;
    private String matchReason;

    @Builder.Default
    private List<String> matchReasons = new ArrayList<>();
}
