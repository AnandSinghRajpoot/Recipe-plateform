package com.recipeplatform.service;

import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.SavedRecipe;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.SavedRecipeDTO;
import com.recipeplatform.mapper.RecipeMapper;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.SavedRecipeRepository;
import com.recipeplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedRecipeService {

    private final SavedRecipeRepository savedRecipeRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final RecipeMapper recipeMapper;

    @Transactional
    public SavedRecipeDTO saveRecipe(Long userId, Long recipeId) {
        if (savedRecipeRepository.existsByUserIdAndRecipeId(userId, recipeId)) {
        return savedRecipeRepository.findByUserIdAndRecipeId(userId, recipeId)
                .map(sr -> SavedRecipeDTO.builder()
                        .id(sr.getId())
                        .recipeId(recipeId)
                        .recipe(recipeMapper.toResponseDTO(sr.getRecipe()))
                        .savedAt(sr.getSavedAt())
                        .build())
                .orElseThrow(() -> new RuntimeException("Consistency error: exists check passed but not found"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        SavedRecipe savedRecipe = SavedRecipe.builder()
                .user(user)
                .recipe(recipe)
                .build();

        savedRecipe = savedRecipeRepository.save(savedRecipe);

        return SavedRecipeDTO.builder()
                .id(savedRecipe.getId())
                .recipeId(recipe.getId())
                .recipe(recipeMapper.toResponseDTO(recipe))
                .savedAt(savedRecipe.getSavedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SavedRecipeDTO> getSavedRecipes(Long userId) {
        return savedRecipeRepository.findByUserId(userId).stream()
                .map(sr -> SavedRecipeDTO.builder()
                        .id(sr.getId())
                        .recipeId(sr.getRecipe().getId())
                        .recipe(recipeMapper.toResponseDTO(sr.getRecipe()))
                        .savedAt(sr.getSavedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeSavedRecipe(Long userId, Long recipeId) {
        savedRecipeRepository.deleteByUserIdAndRecipeId(userId, recipeId);
    }
}
