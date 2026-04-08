package com.recipeplatform.service;

import com.recipeplatform.dto.recipe.RecipeRequestDto;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RecipeService {

    RecipeResponseDTO createRecipe(RecipeRequestDto recipeDTO, MultipartFile file);

    RecipeResponseDTO updateRecipe(Long id, RecipeRequestDto recipeDTO, MultipartFile file);

    void deleteRecipe(Long id);

    RecipeResponseDTO getRecipeById(Long id);

    List<RecipeResponseDTO> getAllRecipes();

    List<RecipeResponseDTO> getRecipesByCategory(String categoryName);

    List<RecipeResponseDTO> searchRecipes(String query);

    List<RecipeResponseDTO> getLatestRecipes();

    List<RecipeResponseDTO> getMyRecipes();
}
