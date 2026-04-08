package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.RecipeRecommendationDTO;
import com.recipeplatform.service.RecommendationEngine;
import com.recipeplatform.util.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationEngine recommendationEngine;
    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecipeRecommendationDTO>>> getRecommendations(
            @RequestParam(defaultValue = "20") int limit) {
        Long userId = currentUser.getCurrentUser().getId();
        List<RecipeRecommendationDTO> recommendations = recommendationEngine.getRecommendations(userId, limit);
        return ResponseEntity.ok(
                new ApiResponse<>("Recommendations generated successfully", recommendations, HttpStatus.OK.value()));
    }
}
