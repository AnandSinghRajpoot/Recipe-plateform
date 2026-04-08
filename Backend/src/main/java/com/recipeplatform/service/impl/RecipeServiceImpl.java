package com.recipeplatform.service.impl;

import com.recipeplatform.domain.Ingredient;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeIngredient;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.recipe.RecipeRequestDto;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.exception.NotAllowedOperation;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.mapper.RecipeMapper;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.service.ImageService;
import com.recipeplatform.service.IngredientService;
import com.recipeplatform.service.RecipeService;
import com.recipeplatform.util.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeMapper recipeMapper;
    private final IngredientService ingredientService;
    private final CurrentUser currentUser;
    private final ImageService imageService;

    public RecipeServiceImpl(RecipeRepository recipeRepository, RecipeMapper recipeMapper,
            IngredientService ingredientService, CurrentUser currentUser, ImageService imageService) {
        this.recipeRepository = recipeRepository;
        this.recipeMapper = recipeMapper;
        this.ingredientService = ingredientService;
        this.currentUser = currentUser;
        this.imageService = imageService;
    }

    @Override
    public RecipeResponseDTO createRecipe(RecipeRequestDto recipeDTO, MultipartFile file) {

        User user = currentUser.getCurrentUser();
        Recipe recipe = recipeMapper.toEntity(recipeDTO);
        recipe.setUser(user);

        // Handle ingredients
        if (recipeDTO.getIngredients() != null && !recipeDTO.getIngredients().isEmpty()) {
            List<RecipeIngredient> recipeIngredients = recipeDTO.getIngredients().stream()
                    .map(dto -> {
                        Ingredient ingredient = ingredientService
                                .getOrCreateIngredientByName(dto.getName().trim().toLowerCase());
                        RecipeIngredient ri = new RecipeIngredient();
                        ri.setRecipe(recipe);
                        ri.setIngredient(ingredient);
                        ri.setQuantity(dto.getQuantity());
                        ri.setUnit(dto.getUnit());
                        return ri;
                    })
                    .collect(Collectors.toList());
            recipe.setIngredients(recipeIngredients);
        }

        String coverImageUrl = null;
        if (file != null) {
            coverImageUrl = imageService.saveImage(file);
        }
        recipe.setCoverImageUrl(coverImageUrl);
        Recipe savedRecipe = recipeRepository.save(recipe);
        return recipeMapper.toResponseDTO(savedRecipe);
    }

    @Override
    public RecipeResponseDTO updateRecipe(Long id, RecipeRequestDto recipeDTO, MultipartFile file) {

        Recipe existingRecipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        // Check if current user is the author
        User user = currentUser.getCurrentUser();
        if (!java.util.Objects.equals(existingRecipe.getUser().getId(), user.getId())) {
            throw new NotAllowedOperation("Unauthorized to update this recipe");
        }

        recipeMapper.updateEntityFromDTO(recipeDTO, existingRecipe);

        // Update image if provided
        if (file != null && !file.isEmpty()) {
            String newImageUrl = imageService.saveImage(file);
            existingRecipe.setCoverImageUrl(newImageUrl);
        }

        // Update ingredients
        if (recipeDTO.getIngredients() != null) {
            existingRecipe.getIngredients().clear();
            List<RecipeIngredient> recipeIngredients = recipeDTO.getIngredients().stream()
                    .map(dto -> {
                        Ingredient ingredient = ingredientService.getOrCreateIngredientByName(dto.getName());
                        RecipeIngredient ri = new RecipeIngredient();
                        ri.setRecipe(existingRecipe);
                        ri.setIngredient(ingredient);
                        ri.setQuantity(dto.getQuantity());
                        ri.setUnit(dto.getUnit());
                        return ri;
                    })
                    .toList();
            existingRecipe.getIngredients().addAll(recipeIngredients);
        }

        Recipe updatedRecipe = recipeRepository.save(existingRecipe);

        return recipeMapper.toResponseDTO(updatedRecipe);
    }

    @Override
    public void deleteRecipe(Long id) {

        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        User user = currentUser.getCurrentUser();
        if (!java.util.Objects.equals(recipe.getUser().getId(), user.getId())) {
            throw new RuntimeException("Unauthorized to delete this recipe");
        }

        recipeRepository.delete(recipe);
    }

    @Override
    @Transactional(readOnly = true)
    public RecipeResponseDTO getRecipeById(Long id) {

        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        return recipeMapper.toResponseDTO(recipe);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getAllRecipes() {

        List<Recipe> recipes = recipeRepository.findAll();
        return recipeMapper.toResponseDTOList(recipes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getRecipesByCategory(String categoryName) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> searchRecipes(String query) {

        List<Recipe> recipes = recipeRepository.searchRecipes(query);
        return recipeMapper.toResponseDTOList(recipes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getLatestRecipes() {

        List<Recipe> recipes = recipeRepository.findAllOrderByCreatedAtDesc();
        return recipeMapper.toResponseDTOList(recipes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getMyRecipes() {
        User user = currentUser.getCurrentUser();
        List<Recipe> recipes = recipeRepository.findByUser(user);
        return recipeMapper.toResponseDTOList(recipes);
    }
}
