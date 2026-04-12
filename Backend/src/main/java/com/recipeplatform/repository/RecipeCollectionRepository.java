package com.recipeplatform.repository;

import com.recipeplatform.domain.RecipeCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeCollectionRepository extends JpaRepository<RecipeCollection, Long> {
    List<RecipeCollection> findByUserId(Long userId);
}
