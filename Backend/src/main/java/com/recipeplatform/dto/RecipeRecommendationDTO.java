package com.recipeplatform.dto;

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
    private Integer prepTime;
    private Integer cookTime;
    private String coverImageUrl;

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

    @Builder.Default
    private List<String> matchReasons = new ArrayList<>();
}
