package com.recipeplatform.repository;

import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.User;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long>, JpaSpecificationExecutor<Recipe> {

    List<Recipe> findByUser(User user);

    List<Recipe> findByUserIdAndIsPublishedTrue(Long userId);

    @Query("SELECT r FROM Recipe r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Recipe> searchRecipes(@Param("query") String query);

    @Query("SELECT r FROM Recipe r WHERE r.deletedAt IS NULL ORDER BY r.createdAt DESC")
    List<Recipe> findAllOrderByCreatedAtDesc();

    // Published only — for public feeds
    List<Recipe> findByIsPublishedTrueAndDeletedAtIsNull();

    List<Recipe> findByDietTypeAndIsPublishedTrueAndDeletedAtIsNull(DietType dietType);

    List<Recipe> findByMealTypeAndIsPublishedTrueAndDeletedAtIsNull(MealType mealType);

    List<Recipe> findByDietTypeAndMealTypeAndIsPublishedTrueAndDeletedAtIsNull(DietType dietType, MealType mealType);

    /**
     * Phase 1 Hard Allergen Exclusion — DB-level filter.
     * Returns all published, non-deleted recipes that do NOT contain any of the given allergen IDs.
     * This query runs at the database layer so allergen data never leaks into application memory.
     */
    @Query("""
        SELECT r FROM Recipe r WHERE r.isPublished = true AND r.deletedAt IS NULL
        AND NOT EXISTS (
            SELECT a FROM r.containsAllergens a
            WHERE a.id IN :allergenIds
        )
    """)
    List<Recipe> findPublishedRecipesExcludingAllergens(@Param("allergenIds") Set<Long> allergenIds);

    /**
     * Find published recipes that have been explicitly vetted as safe
     * for any of the given disease IDs.
     */
    @Query("""
        SELECT DISTINCT r FROM Recipe r
        JOIN r.safeForDiseases d
        WHERE d.id IN :diseaseIds AND r.isPublished = true AND r.deletedAt IS NULL
    """)
    List<Recipe> findPublishedRecipesSafeForDiseases(@Param("diseaseIds") Set<Long> diseaseIds);
}
