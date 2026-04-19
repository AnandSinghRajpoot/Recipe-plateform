package com.recipeplatform.service;

import com.recipeplatform.domain.enums.CuisineType;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.Difficulty;
import com.recipeplatform.domain.enums.MealType;
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

    List<RecipeResponseDTO> filterRecipes(
            String query,
            Difficulty difficulty,
            DietType dietType,
            MealType mealType,
            CuisineType cuisineType,
            Double minCalories,
            Double maxCalories,
            Long authorId,
            Integer minPrepTime,
            Integer maxPrepTime);

    List<RecipeResponseDTO> getLatestRecipes();

    List<RecipeResponseDTO> getMyRecipes();

    RecipeResponseDTO togglePublish(Long id);
}
