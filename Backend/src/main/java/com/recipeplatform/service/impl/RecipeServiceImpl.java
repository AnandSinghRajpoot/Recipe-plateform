//package com.recipeplatform.service.impl;
//
//import com.recipeplatform.domain.Category;
//import com.recipeplatform.domain.Ingredient;
//import com.recipeplatform.domain.Recipe;
//import com.recipeplatform.dto.RecipeRequestDTO;
//import com.recipeplatform.dto.RecipeResponseDTO;
//import com.recipeplatform.exception.ResourceNotFoundException;
//import com.recipeplatform.mapper.IngredientMapper;
//import com.recipeplatform.mapper.RecipeMapper;
//import com.recipeplatform.repository.CategoryRepository;
//import com.recipeplatform.repository.RecipeRepository;
//import com.recipeplatform.service.RecipeService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//@Transactional
//public class RecipeServiceImpl implements RecipeService {
//
//    private final RecipeRepository recipeRepository;
//    private final CategoryRepository categoryRepository;
//    private final RecipeMapper recipeMapper;
//    private final IngredientMapper ingredientMapper;
//
//    @Override
//    public RecipeResponseDTO createRecipe(RecipeRequestDTO recipeDTO) {
//        log.debug("Creating new recipe: {}", recipeDTO.getName());
//
//        Recipe recipe = recipeMapper.toEntity(recipeDTO);
//
//        // Set category if provided
//        if (recipeDTO.getCategoryId() != null) {
//            Category category = categoryRepository.findById(recipeDTO.getCategoryId())
//                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", recipeDTO.getCategoryId()));
//            recipe.setCategory(category);
//        }
//
//        // Handle ingredients
//        if (recipeDTO.getIngredients() != null && !recipeDTO.getIngredients().isEmpty()) {
//            recipe.getIngredients().clear();
//            recipeDTO.getIngredients().forEach(ingredientDTO -> {
//                Ingredient ingredient = ingredientMapper.toEntity(ingredientDTO);
//                recipe.addIngredient(ingredient);
//            });
//        }
//
//        Recipe savedRecipe = recipeRepository.save(recipe);
//        log.info("Recipe created successfully with id: {}", savedRecipe.getId());
//
//        return recipeMapper.toResponseDTO(savedRecipe);
//    }
//
//    @Override
//    public RecipeResponseDTO updateRecipe(Long id, RecipeRequestDTO recipeDTO) {
//        log.debug("Updating recipe with id: {}", id);
//
//        Recipe existingRecipe = recipeRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
//
//        recipeMapper.updateEntityFromDTO(recipeDTO, existingRecipe);
//
//        // Update category if provided
//        if (recipeDTO.getCategoryId() != null) {
//            Category category = categoryRepository.findById(recipeDTO.getCategoryId())
//                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", recipeDTO.getCategoryId()));
//            existingRecipe.setCategory(category);
//        }
//
//        // Update ingredients
//        if (recipeDTO.getIngredients() != null) {
//            existingRecipe.getIngredients().clear();
//            recipeDTO.getIngredients().forEach(ingredientDTO -> {
//                Ingredient ingredient = ingredientMapper.toEntity(ingredientDTO);
//                existingRecipe.addIngredient(ingredient);
//            });
//        }
//
//        Recipe updatedRecipe = recipeRepository.save(existingRecipe);
//        log.info("Recipe updated successfully with id: {}", id);
//
//        return recipeMapper.toResponseDTO(updatedRecipe);
//    }
//
//    @Override
//    public void deleteRecipe(Long id) {
//        log.debug("Deleting recipe with id: {}", id);
//
//        if (!recipeRepository.existsById(id)) {
//            throw new ResourceNotFoundException("Recipe", "id", id);
//        }
//
//        recipeRepository.deleteById(id);
//        log.info("Recipe deleted successfully with id: {}", id);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public RecipeResponseDTO getRecipeById(Long id) {
//        log.debug("Fetching recipe with id: {}", id);
//
//        Recipe recipe = recipeRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
//
//        return recipeMapper.toResponseDTO(recipe);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public List<RecipeResponseDTO> getAllRecipes() {
//        log.debug("Fetching all recipes");
//
//        List<Recipe> recipes = recipeRepository.findAll();
//        return recipeMapper.toResponseDTOList(recipes);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public List<RecipeResponseDTO> getRecipesByCategory(String categoryName) {
//        log.debug("Fetching recipes by category: {}", categoryName);
//
//        List<Recipe> recipes = recipeRepository.findByCategory_Name(categoryName);
//        return recipeMapper.toResponseDTOList(recipes);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public List<RecipeResponseDTO> searchRecipes(String query) {
//        log.debug("Searching recipes with query: {}", query);
//
//        List<Recipe> recipes = recipeRepository.searchRecipes(query);
//        return recipeMapper.toResponseDTOList(recipes);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public List<RecipeResponseDTO> getLatestRecipes() {
//        log.debug("Fetching latest recipes");
//
//        List<Recipe> recipes = recipeRepository.findAllOrderByCreatedAtDesc();
//        return recipeMapper.toResponseDTOList(recipes);
//    }
//}
