package com.recipeplatform.service;

import com.recipeplatform.domain.Recipe;

public interface HealthAnalysisEngine {
    void performAnalysis(Recipe recipe);
    void detectAllergens(Recipe recipe);
}
