package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.review.RatingStatsDTO;
import com.recipeplatform.dto.review.ReviewRequestDTO;
import com.recipeplatform.dto.review.ReviewResponseDTO;
import com.recipeplatform.service.ReviewService;
import com.recipeplatform.util.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUser currentUser;

    // Get all reviews for a recipe
    @GetMapping("/recipe/{recipeId}")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getReviewsForRecipe(@PathVariable Long recipeId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsForRecipe(recipeId);
        return ResponseEntity.ok(new ApiResponse<List<ReviewResponseDTO>>("Reviews retrieved successfully", reviews, HttpStatus.OK.value()));
    }

    // Get current user's review for a recipe
    @GetMapping("/recipe/{recipeId}/my-review")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> getMyReviewForRecipe(@PathVariable Long recipeId) {
        Long userId = currentUser.getCurrentUser().getId();
        ReviewResponseDTO review = reviewService.getUserReviewForRecipe(recipeId, userId);
        if (review == null) {
            return ResponseEntity.ok(new ApiResponse<ReviewResponseDTO>("No review found", null, HttpStatus.OK.value()));
        }
        return ResponseEntity.ok(new ApiResponse<ReviewResponseDTO>("Review retrieved successfully", review, HttpStatus.OK.value()));
    }

    // Create or update review
    @PostMapping("/recipe/{recipeId}")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> createOrUpdateReview(
            @PathVariable Long recipeId,
            @Valid @RequestBody ReviewRequestDTO request) {
        Long userId = currentUser.getCurrentUser().getId();
        ReviewResponseDTO review = reviewService.createOrUpdateReview(recipeId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<ReviewResponseDTO>("Review submitted successfully", review, HttpStatus.CREATED.value()));
    }

    // Delete review
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long reviewId) {
        Long userId = currentUser.getCurrentUser().getId();
        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.ok(new ApiResponse<Void>("Review deleted successfully", null, HttpStatus.OK.value()));
    }

    // Get rating stats for a recipe
    @GetMapping("/recipe/{recipeId}/stats")
    public ResponseEntity<ApiResponse<RatingStatsDTO>> getRatingStats(@PathVariable Long recipeId) {
        double averageRating = reviewService.getAverageRating(recipeId);
        long reviewCount = reviewService.getReviewCount(recipeId);

        RatingStatsDTO stats = new RatingStatsDTO(averageRating, reviewCount);
        return ResponseEntity.ok(new ApiResponse<RatingStatsDTO>("Rating stats retrieved", stats, HttpStatus.OK.value()));
    }
}