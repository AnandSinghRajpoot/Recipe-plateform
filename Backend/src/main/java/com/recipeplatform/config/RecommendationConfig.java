package com.recipeplatform.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.recommendation")
@Data
public class RecommendationConfig {

    // Scoring weights
    private int dietMatchScore = 20;
    private int lowSugarScore = 10;
    private int lowSodiumScore = 10;
    private int highFiberScore = 5;
    private int highProteinScore = 8;

    // Soft restriction penalties
    private int avoidPenalty = -5;
    private int limitPenalty = -10;
    private int eliminatePenalty = -15;

    // Nutritional thresholds
    private double lowSugarThreshold = 10.0; // grams
    private double lowSodiumThreshold = 500.0; // mg
    private double highFiberThreshold = 5.0; // grams
    private double highProteinThreshold = 15.0; // grams
}
