package com.recipeplatform.service;

import com.recipeplatform.dto.recipe.RecipeRequestDto;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;

import java.util.List;

public interface RecipeService {

    RecipeResponseDTO createRecipe(RecipeRequestDto recipeDTO);

    RecipeResponseDTO updateRecipe(Long id, RecipeRequestDto recipeDTO);

    void deleteRecipe(Long id);

    RecipeResponseDTO getRecipeById(Long id);

    List<RecipeResponseDTO> getAllRecipes();

    List<RecipeResponseDTO> getRecipesByCategory(String categoryName);

    List<RecipeResponseDTO> searchRecipes(String query);

    List<RecipeResponseDTO> getLatestRecipes();
}
