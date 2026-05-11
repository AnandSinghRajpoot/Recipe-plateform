package com.recipeplatform.dto.recipe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeHealthAnalysisDTO {
    private String condition;
    private Integer compatibilityScore;
    private String riskLevel;
    private List<String> warnings;
    private String analysisReason;
}
