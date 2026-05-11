package com.recipeplatform.repository;

import com.recipeplatform.domain.RecipeView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecipeViewRepository extends JpaRepository<RecipeView, Long> {
    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);
}
