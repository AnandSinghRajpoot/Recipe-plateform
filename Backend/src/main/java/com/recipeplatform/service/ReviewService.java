package com.recipeplatform.service;

import com.recipeplatform.dto.review.ReviewRequestDTO;
import com.recipeplatform.dto.review.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {

    // Create or update a review
    ReviewResponseDTO createOrUpdateReview(Long recipeId, Long userId, ReviewRequestDTO request);

    // Get review by user and recipe
    ReviewResponseDTO getUserReviewForRecipe(Long recipeId, Long userId);

    // Get all reviews for a recipe
    List<ReviewResponseDTO> getReviewsForRecipe(Long recipeId);

    // Delete review
    void deleteReview(Long reviewId, Long userId);

    // Get average rating and count for recipe
    double getAverageRating(Long recipeId);
    long getReviewCount(Long recipeId);
}