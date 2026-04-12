package com.recipeplatform.service.impl;

import com.recipeplatform.domain.Allergy;
import com.recipeplatform.domain.Disease;
import com.recipeplatform.domain.Ingredient;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeIngredient;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.recipe.RecipeRequestDto;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.exception.NotAllowedOperation;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.mapper.RecipeMapper;
import com.recipeplatform.repository.AllergyRepository;
import com.recipeplatform.repository.DiseaseRepository;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.service.ImageService;
import com.recipeplatform.service.IngredientService;
import com.recipeplatform.service.RecipeService;
import com.recipeplatform.util.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeMapper recipeMapper;
    private final IngredientService ingredientService;
    private final CurrentUser currentUser;
    private final ImageService imageService;
    private final AllergyRepository allergyRepository;
    private final DiseaseRepository diseaseRepository;

    public RecipeServiceImpl(RecipeRepository recipeRepository, RecipeMapper recipeMapper,
            IngredientService ingredientService, CurrentUser currentUser, ImageService imageService,
            AllergyRepository allergyRepository, DiseaseRepository diseaseRepository) {
        this.recipeRepository = recipeRepository;
        this.recipeMapper = recipeMapper;
        this.ingredientService = ingredientService;
        this.currentUser = currentUser;
        this.imageService = imageService;
        this.allergyRepository = allergyRepository;
        this.diseaseRepository = diseaseRepository;
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

        // Wire allergens
        if (recipeDTO.getAllergenIds() != null && !recipeDTO.getAllergenIds().isEmpty()) {
            Set<Allergy> allergens = new HashSet<>(allergyRepository.findAllById(recipeDTO.getAllergenIds()));
            recipe.setContainsAllergens(allergens);
        }

        // Wire safe-for diseases
        if (recipeDTO.getSafeForDiseaseIds() != null && !recipeDTO.getSafeForDiseaseIds().isEmpty()) {
            Set<Disease> diseases = new HashSet<>(diseaseRepository.findAllById(recipeDTO.getSafeForDiseaseIds()));
            recipe.setSafeForDiseases(diseases);
        }

        // Handle cover image
        if (file != null && !file.isEmpty()) {
            recipe.setCoverImageUrl(imageService.saveImage(file));
        }

        Recipe savedRecipe = recipeRepository.save(recipe);
        return recipeMapper.toResponseDTO(savedRecipe);
    }

    @Override
    public RecipeResponseDTO updateRecipe(Long id, RecipeRequestDto recipeDTO, MultipartFile file) {
        Recipe existingRecipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        User user = currentUser.getCurrentUser();
        if (!java.util.Objects.equals(existingRecipe.getUser().getId(), user.getId())) {
            throw new NotAllowedOperation("Unauthorized to update this recipe");
        }

        recipeMapper.updateEntityFromDTO(recipeDTO, existingRecipe);

        // Update image if provided
        if (file != null && !file.isEmpty()) {
            existingRecipe.setCoverImageUrl(imageService.saveImage(file));
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

        // Update allergens
        if (recipeDTO.getAllergenIds() != null) {
            existingRecipe.setContainsAllergens(
                new HashSet<>(allergyRepository.findAllById(recipeDTO.getAllergenIds())));
        }

        // Update safe-for diseases
        if (recipeDTO.getSafeForDiseaseIds() != null) {
            existingRecipe.setSafeForDiseases(
                new HashSet<>(diseaseRepository.findAllById(recipeDTO.getSafeForDiseaseIds())));
        }

        return recipeMapper.toResponseDTO(recipeRepository.save(existingRecipe));
    }

    @Override
    public void deleteRecipe(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        User user = currentUser.getCurrentUser();
        if (!java.util.Objects.equals(recipe.getUser().getId(), user.getId())) {
            throw new NotAllowedOperation("Unauthorized to delete this recipe");
        }

        // Soft delete
        recipe.setDeletedAt(LocalDateTime.now());
        recipeRepository.save(recipe);
    }

    @Override
    public RecipeResponseDTO togglePublish(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        User user = currentUser.getCurrentUser();
        if (!java.util.Objects.equals(recipe.getUser().getId(), user.getId())) {
            throw new NotAllowedOperation("Unauthorized to publish this recipe");
        }

        recipe.setIsPublished(!recipe.getIsPublished());
        return recipeMapper.toResponseDTO(recipeRepository.save(recipe));
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
        // Public feed: only published, non-deleted
        return recipeMapper.toResponseDTOList(
            recipeRepository.findByIsPublishedTrueAndDeletedAtIsNull());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getRecipesByCategory(String categoryName) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> searchRecipes(String query) {
        return recipeMapper.toResponseDTOList(recipeRepository.searchRecipes(query));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getLatestRecipes() {
        return recipeMapper.toResponseDTOList(recipeRepository.findAllOrderByCreatedAtDesc());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getMyRecipes() {
        User user = currentUser.getCurrentUser();
        return recipeMapper.toResponseDTOList(recipeRepository.findByUser(user));
    }
}
