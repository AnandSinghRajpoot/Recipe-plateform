package com.recipeplatform.service.impl;

import com.recipeplatform.domain.Disease;
import com.recipeplatform.domain.Nutrition;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeHealthAnalysis;
import com.recipeplatform.domain.enums.RiskLevel;
import com.recipeplatform.repository.AllergyRepository;
import com.recipeplatform.repository.AllergyRestrictionRepository;
import com.recipeplatform.repository.DiseaseRepository;
import com.recipeplatform.service.HealthAnalysisEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthAnalysisEngineImpl implements HealthAnalysisEngine {

    private final DiseaseRepository diseaseRepository;
    private final AllergyRestrictionRepository allergyRestrictionRepository;
    private final AllergyRepository allergyRepository;

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

    @Override
    public void detectAllergens(Recipe recipe) {
        if (recipe.getIngredients() == null || recipe.getIngredients().isEmpty()) {
            return;
        }

        Set<com.recipeplatform.domain.Allergy> detectedAllergens = new HashSet<>();
        List<com.recipeplatform.domain.AllergyRestriction> restrictions = allergyRestrictionRepository.findAll();

        for (com.recipeplatform.domain.RecipeIngredient ri : recipe.getIngredients()) {
            if (ri.getIngredient() == null) continue;
            Long ingId = ri.getIngredient().getId();
            String ingName = ri.getIngredient().getName().toLowerCase();

            for (com.recipeplatform.domain.AllergyRestriction restriction : restrictions) {
                if (restriction.getIngredient().getId().equals(ingId)) {
                    detectedAllergens.add(restriction.getAllergy());
                }
            }

            if ((ingName.contains("egg") && !ingName.contains("eggplant")) || 
                 ingName.contains("mayo") || ingName.contains("tartar") || 
                 ingName.contains("custard") || ingName.contains("meringue")) {
                addAllergyByName(detectedAllergens, "Eggs");
            }
            if (ingName.contains("milk") || ingName.contains("cheese") || ingName.contains("butter") || 
                ingName.contains("cream") || ingName.contains("yogurt") || ingName.contains("paneer") || 
                ingName.contains("ghee") || ingName.contains("whey") || ingName.contains("casein")) {
                addAllergyByName(detectedAllergens, "Milk / Dairy");
            }
            if (ingName.contains("peanut")) {
                addAllergyByName(detectedAllergens, "Peanuts");
            }
            if (ingName.contains("fish") || ingName.contains("salmon") || ingName.contains("tuna") || 
                ingName.contains("anchov") || ingName.contains("sardine") || ingName.contains("cod") || 
                ingName.contains("dashi") || (ingName.contains("sauce") && ingName.contains("oyster"))) {
                addAllergyByName(detectedAllergens, "Fish");
            }
            if (ingName.contains("shrimp") || ingName.contains("crab") || ingName.contains("lobster") || 
                ingName.contains("prawn") || ingName.contains("oyster") || ingName.contains("mollusc") || 
                ingName.contains("mussel") || ingName.contains("clam") || ingName.contains("scallop")) {
                addAllergyByName(detectedAllergens, "Shellfish");
                addAllergyByName(detectedAllergens, "Molluscs");
            }
            if (ingName.contains("soy") || ingName.contains("tofu") || ingName.contains("miso") || ingName.contains("edamame")) {
                addAllergyByName(detectedAllergens, "Soy");
            }
            if (ingName.contains("wheat") || ingName.contains("flour") || ingName.contains("bread") || 
                ingName.contains("pasta") || ingName.contains("semolina") || ingName.contains("fettuccine") || 
                ingName.contains("couscous") || ingName.contains("maida")) {
                addAllergyByName(detectedAllergens, "Wheat / Gluten");
            }
        }

        if (recipe.getContainsAllergens() == null) {
            recipe.setContainsAllergens(detectedAllergens);
        } else {
            recipe.getContainsAllergens().addAll(detectedAllergens);
        }

        if (!detectedAllergens.isEmpty()) {
            log.info("Detected allergens for recipe '{}': {}", recipe.getTitle(), 
                detectedAllergens.stream().map(com.recipeplatform.domain.Allergy::getName).collect(Collectors.joining(", ")));
        }
    }

    private void addAllergyByName(Set<com.recipeplatform.domain.Allergy> set, String name) {
        allergyRepository.findByNameIgnoreCase(name).ifPresent(set::add);
    }
}
