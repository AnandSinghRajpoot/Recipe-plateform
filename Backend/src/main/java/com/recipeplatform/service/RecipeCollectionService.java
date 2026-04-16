package com.recipeplatform.service;

import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeCollection;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.RecipeCollectionDTO;
import com.recipeplatform.mapper.RecipeMapper;
import com.recipeplatform.repository.RecipeCollectionRepository;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeCollectionService {

    private final RecipeCollectionRepository collectionRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final RecipeMapper recipeMapper;

    @Transactional
    public RecipeCollectionDTO createCollection(Long userId, String name, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RecipeCollection collection = RecipeCollection.builder()
                .user(user)
                .name(name)
                .description(description)
                .build();

        collection = collectionRepository.save(collection);
        return mapToDTO(collection);
    }

    @Transactional(readOnly = true)
    public List<RecipeCollectionDTO> getUserCollections(Long userId) {
        return collectionRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecipeCollectionDTO addRecipeToCollection(Long collectionId, Long recipeId, Long userId) {
        RecipeCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        collection.getRecipes().add(recipe);
        collectionRepository.save(collection);
        
        return mapToDTO(collection);
    }

    @Transactional
    public void deleteCollection(Long collectionId, Long userId) {
        RecipeCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        if (!collection.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        collectionRepository.delete(collection);
    }

    @Transactional
    public RecipeCollectionDTO moveRecipeToCollection(Long fromCollectionId, Long toCollectionId, Long recipeId, Long userId) {
        RecipeCollection fromCollection = collectionRepository.findById(fromCollectionId)
                .orElseThrow(() -> new RuntimeException("Source collection not found"));
        RecipeCollection toCollection = collectionRepository.findById(toCollectionId)
                .orElseThrow(() -> new RuntimeException("Target collection not found"));

        if (!fromCollection.getUser().getId().equals(userId) || !toCollection.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        fromCollection.getRecipes().remove(recipe);
        collectionRepository.save(fromCollection);

        toCollection.getRecipes().add(recipe);
        collectionRepository.save(toCollection);

        return mapToDTO(toCollection);
    }

    @Transactional
    public RecipeCollectionDTO addSavedRecipeToCollection(Long collectionId, Long recipeId, Long userId) {
        RecipeCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        collection.getRecipes().add(recipe);
        collectionRepository.save(collection);

        return mapToDTO(collection);
    }

    private RecipeCollectionDTO mapToDTO(RecipeCollection collection) {
        return RecipeCollectionDTO.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .createdAt(collection.getCreatedAt())
                .recipes(collection.getRecipes().stream()
                        .map(recipeMapper::toResponseDTO)
                        .collect(Collectors.toList()))
                .build();
    }
}
