package com.recipeplatform.repository;

import com.recipeplatform.domain.RecipeLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<RecipeLike, Long> {
    Optional<RecipeLike> findByUserIdAndRecipeId(Long userId, Long recipeId);
    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);
    long countByRecipeId(Long recipeId);
}
