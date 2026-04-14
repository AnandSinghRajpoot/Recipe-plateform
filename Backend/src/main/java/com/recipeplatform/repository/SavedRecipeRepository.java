package com.recipeplatform.repository;

import com.recipeplatform.domain.SavedRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedRecipeRepository extends JpaRepository<SavedRecipe, Long> {
    List<SavedRecipe> findByUserId(Long userId);
    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);
    void deleteByUserIdAndRecipeId(Long userId, Long recipeId);
    long countByRecipeId(Long recipeId);
}
