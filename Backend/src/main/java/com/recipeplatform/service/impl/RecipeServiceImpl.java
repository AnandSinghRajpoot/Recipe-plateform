package com.recipeplatform.service.impl;

import com.recipeplatform.domain.Allergy;
import com.recipeplatform.domain.Disease;
import com.recipeplatform.domain.Ingredient;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeIngredient;
import com.recipeplatform.domain.User;
import com.recipeplatform.domain.RecipeLike;
import com.recipeplatform.domain.RecipeComment;
import com.recipeplatform.domain.enums.CuisineType;
import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.Difficulty;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.AuthorDto;
import com.recipeplatform.dto.CommentResponseDto;
import com.recipeplatform.dto.recipe.RecipeRequestDto;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.exception.NotAllowedOperation;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.mapper.RecipeMapper;
import com.recipeplatform.repository.AllergyRepository;
import com.recipeplatform.repository.CommentRepository;
import com.recipeplatform.repository.DiseaseRepository;
import com.recipeplatform.repository.LikeRepository;
import com.recipeplatform.repository.SavedRecipeRepository;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.service.ImageService;
import com.recipeplatform.service.IngredientService;
import com.recipeplatform.service.RecipeService;
import com.recipeplatform.specification.RecipeSpecification;
import com.recipeplatform.util.CurrentUser;
import org.springframework.data.jpa.domain.Specification;
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
    private final SavedRecipeRepository savedRecipeRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public RecipeServiceImpl(RecipeRepository recipeRepository, RecipeMapper recipeMapper,
            IngredientService ingredientService, CurrentUser currentUser, ImageService imageService,
            AllergyRepository allergyRepository, DiseaseRepository diseaseRepository, 
            SavedRecipeRepository savedRecipeRepository, LikeRepository likeRepository,
            CommentRepository commentRepository) {
        this.recipeRepository = recipeRepository;
        this.recipeMapper = recipeMapper;
        this.ingredientService = ingredientService;
        this.currentUser = currentUser;
        this.imageService = imageService;
        this.allergyRepository = allergyRepository;
        this.diseaseRepository = diseaseRepository;
        this.savedRecipeRepository = savedRecipeRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    @Override
    public RecipeResponseDTO createRecipe(RecipeRequestDto dto, MultipartFile coverImage) {
        Recipe recipe = recipeMapper.toEntity(dto);
        User user = currentUser.getCurrentUser();
        recipe.setUser(user);
        
        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = imageService.saveImage(coverImage);
            recipe.setCoverImageUrl(imageUrl);
        }

        mapComplexRelationships(recipe, dto);
        Recipe savedRecipe = recipeRepository.save(recipe);
        return recipeMapper.toResponseDTO(savedRecipe);
    }

    @Override
    public RecipeResponseDTO updateRecipe(Long id, RecipeRequestDto dto, MultipartFile coverImage) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        User user = currentUser.getCurrentUser();
        if (!java.util.Objects.equals(recipe.getUser().getId(), user.getId())) {
            throw new NotAllowedOperation("Unauthorized to update this recipe");
        }

        recipeMapper.updateEntityFromDTO(dto, recipe);
        mapComplexRelationships(recipe, dto);
        
        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = imageService.saveImage(coverImage);
            recipe.setCoverImageUrl(imageUrl);
        }

        Recipe updatedRecipe = recipeRepository.save(recipe);
        return recipeMapper.toResponseDTO(updatedRecipe);
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
        RecipeResponseDTO dto = recipeMapper.toResponseDTO(recipe);
        populateSocialData(dto);
        
        // Populate comments
        dto.setComments(commentRepository.findByRecipeIdOrderByCreatedAtDesc(id).stream()
            .map(c -> {
                AuthorDto author = new AuthorDto(c.getUser().getId(), c.getUser().getName(), 
                    recipeMapper.resolveUrl(c.getUser().getProfilePhoto()), c.getUser().getRole());
                return new CommentResponseDto(c.getId(), c.getContent(), author, c.getCreatedAt());
            })
            .collect(Collectors.toList()));
            
        return dto;
    }

    private void populateSocialData(RecipeResponseDTO dto) {
        dto.setSavedCount(savedRecipeRepository.countByRecipeId(dto.getId()));
        dto.setLikesCount(likeRepository.countByRecipeId(dto.getId()));
        
        try {
            User user = currentUser.getCurrentUser();
            if (user != null) {
                dto.setIsLiked(likeRepository.existsByUserIdAndRecipeId(user.getId(), dto.getId()));
            }
        } catch (Exception e) {
            // User not authenticated
            dto.setIsLiked(false);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getAllRecipes() {
        List<RecipeResponseDTO> dtos = recipeMapper.toResponseDTOList(
            recipeRepository.findByIsPublishedTrueAndDeletedAtIsNull());
        dtos.forEach(this::populateSocialData);
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> filterRecipes(
            String query,
            Difficulty difficulty,
            DietType dietType,
            MealType mealType,
            CuisineType cuisineType,
            Double minCalories,
            Double maxCalories,
            Long authorId,
            Integer maxPrepTime) {

        // If authorId is provided, fetch recipes by that author directly
        if (authorId != null) {
            List<Recipe> recipes = recipeRepository.findByUserIdAndIsPublishedTrue(authorId);
            List<RecipeResponseDTO> dtos = recipeMapper.toResponseDTOList(recipes);
            dtos.forEach(this::populateSocialData);
            return dtos;
        }

        Specification<Recipe> spec = RecipeSpecification.filterRecipes(
                query, difficulty, dietType, mealType, cuisineType, minCalories, maxCalories, maxPrepTime);

        List<Recipe> recipes = recipeRepository.findAll(spec);
        List<RecipeResponseDTO> dtos = recipeMapper.toResponseDTOList(recipes);
        dtos.forEach(this::populateSocialData);
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getRecipesByCategory(String categoryName) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> searchRecipes(String query) {
        List<RecipeResponseDTO> dtos = recipeMapper.toResponseDTOList(recipeRepository.searchRecipes(query));
        dtos.forEach(this::populateSocialData);
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getLatestRecipes() {
        List<RecipeResponseDTO> dtos = recipeMapper.toResponseDTOList(recipeRepository.findAllOrderByCreatedAtDesc());
        dtos.forEach(this::populateSocialData);
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getMyRecipes() {
        User user = currentUser.getCurrentUser();
        List<RecipeResponseDTO> dtos = recipeMapper.toResponseDTOList(recipeRepository.findByUser(user));
        dtos.forEach(this::populateSocialData);
        return dtos;
    }

    private void mapComplexRelationships(Recipe recipe, RecipeRequestDto dto) {
        // Handle Ingredients
        if (dto.getIngredients() != null) {
            recipe.getIngredients().clear();
            dto.getIngredients().forEach(ingDto -> {
                Ingredient ingredient = ingredientService.getOrCreateIngredientByName(ingDto.getName());
                RecipeIngredient recipeIngredient = new RecipeIngredient();
                recipeIngredient.setRecipe(recipe);
                recipeIngredient.setIngredient(ingredient);
                recipeIngredient.setQuantity(ingDto.getQuantity());
                recipeIngredient.setUnit(ingDto.getUnit());
                recipe.getIngredients().add(recipeIngredient);
            });
        }

        // Handle Allergens
        if (dto.getAllergenIds() != null) {
            Set<Allergy> allergens = new HashSet<>(allergyRepository.findAllById(dto.getAllergenIds()));
            recipe.setContainsAllergens(allergens);
        }

        // Handle Safe Diseases
        if (dto.getSafeForDiseaseIds() != null) {
            Set<Disease> diseases = new HashSet<>(diseaseRepository.findAllById(dto.getSafeForDiseaseIds()));
            recipe.setSafeForDiseases(diseases);
        }
    }
}
