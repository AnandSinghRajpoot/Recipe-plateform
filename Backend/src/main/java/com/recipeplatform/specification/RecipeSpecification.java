package com.recipeplatform.specification;

import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.enums.CuisineType;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.Difficulty;
import com.recipeplatform.domain.enums.MealType;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Expression;
import java.util.ArrayList;
import java.util.List;

public class RecipeSpecification {

    public static Specification<Recipe> filterRecipes(
            String query,
            Difficulty difficulty,
            DietType dietType,
            MealType mealType,
            CuisineType cuisineType,
            Double minCalories,
            Double maxCalories,
            Integer minPrepTime,
            Integer maxPrepTime
    ) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only published recipes
            predicates.add(criteriaBuilder.equal(root.get("isPublished"), true));
            predicates.add(criteriaBuilder.isNull(root.get("deletedAt")));

            if (query != null && !query.isEmpty()) {
                String searchPattern = "%" + query.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), searchPattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern)
                ));
            }

            if (difficulty != null) {
                predicates.add(criteriaBuilder.equal(root.get("difficulty"), difficulty));
            }

            if (dietType != null) {
                predicates.add(criteriaBuilder.equal(root.get("dietType"), dietType));
            }

            if (mealType != null) {
                predicates.add(criteriaBuilder.equal(root.get("mealType"), mealType));
            }

            if (cuisineType != null) {
                predicates.add(criteriaBuilder.equal(root.get("cuisineType"), cuisineType));
            }

            if (minCalories != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("nutrition").get("calories"), minCalories));
            }

            if (maxCalories != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("nutrition").get("calories"), maxCalories));
            }

            if (minPrepTime != null || maxPrepTime != null) {
                Expression<Integer> prep = criteriaBuilder.coalesce(root.get("prepTime"), 0);
                Expression<Integer> cook = criteriaBuilder.coalesce(root.get("cookTime"), 0);
                Expression<Integer> totalTime = criteriaBuilder.sum(prep, cook);
                if (minPrepTime != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(totalTime, minPrepTime));
                }
                if (maxPrepTime != null) {
                    if (minPrepTime != null) {
                        // Range: inclusive
                        predicates.add(criteriaBuilder.lessThanOrEqualTo(totalTime, maxPrepTime));
                    } else {
                        // Under: exclusive
                        predicates.add(criteriaBuilder.lessThan(totalTime, maxPrepTime));
                    }
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
