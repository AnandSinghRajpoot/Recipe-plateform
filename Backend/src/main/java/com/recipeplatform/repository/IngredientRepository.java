package com.recipeplatform.repository;

import com.recipeplatform.domain.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    boolean existsByNameIgnoreCase(String name);

    java.util.Optional<Ingredient> findByNameIgnoreCase(String name);
}
