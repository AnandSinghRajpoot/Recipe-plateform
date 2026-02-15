package com.recipeplatform.service;

import com.recipeplatform.domain.Ingredient;
import com.recipeplatform.dto.ingredient.IngredientRequestDto;
import com.recipeplatform.dto.ingredient.IngredientResponseDto;

import java.util.List;

public interface IngredientService {

    IngredientResponseDto createIngredient(IngredientRequestDto ingredientRequestDto);

    Ingredient getIngredientById(Long id);

    List<Ingredient> getAllIngredients();

    void deleteIngredient(Long id);

    Ingredient getOrCreateIngredientByName(String name);
}
