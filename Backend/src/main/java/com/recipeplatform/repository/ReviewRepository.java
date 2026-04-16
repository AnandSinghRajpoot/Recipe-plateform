package com.recipeplatform.repository;

import com.recipeplatform.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Find review by user and recipe
    Optional<Review> findByUserIdAndRecipeId(Long userId, Long recipeId);

    // Check if user has already reviewed this recipe
    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);

    // Get all reviews for a recipe
    List<Review> findByRecipeIdOrderByCreatedAtDesc(Long recipeId);

    // Get all reviews by a user
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Get average rating for a recipe
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.recipe.id = :recipeId")
    Double findAverageRatingByRecipeId(@Param("recipeId") Long recipeId);

    // Get review count for a recipe
    @Query("SELECT COUNT(r) FROM Review r WHERE r.recipe.id = :recipeId")
    Long countByRecipeId(@Param("recipeId") Long recipeId);
}