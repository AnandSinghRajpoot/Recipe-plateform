package com.recipeplatform.service.impl;

import com.recipeplatform.domain.Disease;
import com.recipeplatform.domain.Nutrition;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeHealthAnalysis;
import com.recipeplatform.domain.enums.RiskLevel;
import com.recipeplatform.repository.DiseaseRepository;
import com.recipeplatform.service.HealthAnalysisEngine;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HealthAnalysisEngineImpl implements HealthAnalysisEngine {

    private final DiseaseRepository diseaseRepository;

    public HealthAnalysisEngineImpl(DiseaseRepository diseaseRepository) {
        this.diseaseRepository = diseaseRepository;
    }

    @Override
    public void performAnalysis(Recipe recipe) {
        if (recipe.getNutrition() == null) {
            return;
        }

        List<Disease> allDiseases = diseaseRepository.findAll();
        List<RecipeHealthAnalysis> analyses = new ArrayList<>();
        Nutrition nutrition = recipe.getNutrition();

        for (Disease disease : allDiseases) {
            RecipeHealthAnalysis analysis = generateAnalysisForDisease(recipe, nutrition, disease);
            analyses.add(analysis);
        }

        if (recipe.getHealthAnalyses() != null) {
            recipe.getHealthAnalyses().clear();
            recipe.getHealthAnalyses().addAll(analyses);
        } else {
            recipe.setHealthAnalyses(analyses);
        }
    }

    private RecipeHealthAnalysis generateAnalysisForDisease(Recipe recipe, Nutrition n, Disease d) {
        int score = 100;
        List<String> warnings = new ArrayList<>();
        StringBuilder reason = new StringBuilder();

        // Basic heuristics
        if (d.getName().toLowerCase().contains("diabet")) {
            if (n.getSugar() != null && n.getSugar() > 10) {
                score -= 30;
                warnings.add("High sugar content");
            }
            if (n.getCarbs() != null && n.getCarbs() > 45) {
                score -= 20;
                warnings.add("High carbohydrate load");
            }
        }

        if (d.getName().toLowerCase().contains("hypertension") || d.getName().toLowerCase().contains("blood pressure")) {
            if (n.getSodium() != null && n.getSodium() > 500) {
                score -= 40;
                warnings.add("Exceeds recommended sodium limits");
            }
        }

        RiskLevel riskLevel;
        if (score < 50) {
            riskLevel = RiskLevel.HIGH;
            reason.append("Not recommended due to significant nutritional concerns.");
        } else if (score < 80) {
            riskLevel = RiskLevel.MEDIUM;
            reason.append("Consume with caution.");
        } else {
            riskLevel = RiskLevel.LOW;
            reason.append("Highly compatible.");
        }

        return RecipeHealthAnalysis.builder()
                .recipe(recipe)
                .disease(d)
                .compatibilityScore(Math.max(0, score))
                .riskLevel(riskLevel)
                .warnings(warnings)
                .analysisReason(reason.toString())
                .generatedBySystem(true)
                .build();
    }
}
