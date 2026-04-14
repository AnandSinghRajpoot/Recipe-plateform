package com.recipeplatform.repository;

import com.recipeplatform.domain.RecipeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<RecipeComment, Long> {
    List<RecipeComment> findByRecipeIdOrderByCreatedAtDesc(Long recipeId);
    long countByRecipeId(Long recipeId);
}
