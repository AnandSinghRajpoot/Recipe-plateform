package com.recipeplatform.service.impl;

import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.Review;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.review.ReviewAuthorDTO;
import com.recipeplatform.dto.review.ReviewRequestDTO;
import com.recipeplatform.dto.review.ReviewResponseDTO;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.ReviewRepository;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReviewResponseDTO createOrUpdateReview(Long recipeId, Long userId, ReviewRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        // Check if user already has a review for this recipe
        Optional<Review> existingReview = reviewRepository.findByUserIdAndRecipeId(userId, recipeId);

        Review review;
        if (existingReview.isPresent()) {
            // Update existing review
            review = existingReview.get();
            review.setRating(request.getRating());
            review.setReviewText(request.getReviewText());
        } else {
            // Create new review
            review = Review.builder()
                    .user(user)
                    .recipe(recipe)
                    .rating(request.getRating())
                    .reviewText(request.getReviewText())
                    .build();
        }

        review = reviewRepository.saveAndFlush(review);
        updateRecipeRatingStats(recipe);
        return mapToDTO(review, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponseDTO getUserReviewForRecipe(Long recipeId, Long userId) {
        Optional<Review> review = reviewRepository.findByUserIdAndRecipeId(userId, recipeId);
        return review.map(r -> mapToDTO(r, userId)).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsForRecipe(Long recipeId) {
        List<Review> reviews = reviewRepository.findByRecipeIdOrderByCreatedAtDesc(recipeId);
        // For now, assume current user is not authenticated for public reviews
        return reviews.stream()
                .map(review -> mapToDTO(review, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this review");
        }

        Recipe recipe = review.getRecipe();
        reviewRepository.delete(review);
        reviewRepository.flush();
        updateRecipeRatingStats(recipe);
    }

    @Override
    @Transactional(readOnly = true)
    public double getAverageRating(Long recipeId) {
        Double avg = reviewRepository.findAverageRatingByRecipeId(recipeId);
        return avg != null ? avg : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public long getReviewCount(Long recipeId) {
        return reviewRepository.countByRecipeId(recipeId);
    }

    private void updateRecipeRatingStats(Recipe recipe) {
        Double avg = reviewRepository.findAverageRatingByRecipeId(recipe.getId());
        Long count = reviewRepository.countByRecipeId(recipe.getId());
        recipe.setAverageRating(avg != null ? avg : 0.0);
        recipe.setReviewCount(count != null ? count : 0L);
        recipeRepository.save(recipe);
    }

    private ReviewResponseDTO mapToDTO(Review review, Long currentUserId) {
        return ReviewResponseDTO.builder()
                .id(review.getId())
                .recipeId(review.getRecipe().getId())
                .author(ReviewAuthorDTO.builder()
                        .id(review.getUser().getId())
                        .name(review.getUser().getName())
                        .profilePhoto(review.getUser().getProfilePhoto())
                        .role(review.getUser().getRole().toString())
                        .build())
                .rating(review.getRating())
                .reviewText(review.getReviewText())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .isOwner(currentUserId != null && currentUserId.equals(review.getUser().getId()))
                .build();
    }
}