package com.recipeplatform.service.impl;

import com.recipeplatform.domain.Ingredient;
import com.recipeplatform.dto.ingredient.IngredientRequestDto;
import com.recipeplatform.dto.ingredient.IngredientResponseDto;
import com.recipeplatform.exception.DuplicateResourceException;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.mapper.IngredientMapper;
import com.recipeplatform.repository.IngredientRepository;
import com.recipeplatform.service.IngredientService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class IngredientServiceImpl implements IngredientService {

    private final IngredientRepository ingredientRepository;
    private final IngredientMapper ingredientMapper;

    public IngredientServiceImpl(IngredientRepository ingredientRepository, IngredientMapper ingredientMapper) {
        this.ingredientRepository = ingredientRepository;
        this.ingredientMapper = ingredientMapper;
    }

    @Override
    public IngredientResponseDto createIngredient(IngredientRequestDto ingredientDto) {
        Ingredient ingredient = ingredientMapper.toEntity(ingredientDto);
        if (ingredientRepository.existsByNameIgnoreCase(ingredient.getName())) {
            throw new DuplicateResourceException(
                    "Ingredient already exists with name: " + ingredient.getName()
            );
        }
        return ingredientMapper.toDto(ingredientRepository.save(ingredient));
    }

    @Override
    public Ingredient getIngredientById(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ingredient not found with id: " + id)
                );
    }

    @Override
    public List<Ingredient> getAllIngredients() {
        return ingredientRepository.findAll();
    }

    @Override
    public void deleteIngredient(Long id) {

        Ingredient ingredient = getIngredientById(id);
        ingredientRepository.delete(ingredient);
    }
}

