package com.recipeplatform.service;

import com.recipeplatform.dto.RecipeRequestDTO;
import com.recipeplatform.dto.RecipeResponseDTO;

import java.util.List;

public interface RecipeService {

    RecipeResponseDTO createRecipe(RecipeRequestDTO recipeDTO);

    RecipeResponseDTO updateRecipe(Long id, RecipeRequestDTO recipeDTO);

    void deleteRecipe(Long id);

    RecipeResponseDTO getRecipeById(Long id);

    List<RecipeResponseDTO> getAllRecipes();

    List<RecipeResponseDTO> getRecipesByCategory(String categoryName);

    List<RecipeResponseDTO> searchRecipes(String query);

    List<RecipeResponseDTO> getLatestRecipes();
}
