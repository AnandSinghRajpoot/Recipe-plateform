package com.recipeplatform.controller;

import com.recipeplatform.domain.Ingredient;
import com.recipeplatform.dto.ingredient.IngredientRequestDto;
import com.recipeplatform.dto.ingredient.IngredientResponseDto;
import com.recipeplatform.service.IngredientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    @PostMapping
    public ResponseEntity<IngredientResponseDto> createIngredient(
            @Valid @RequestBody IngredientRequestDto ingredient) {
        IngredientResponseDto saved = ingredientService.createIngredient(ingredient);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ingredient> getIngredient(@PathVariable Long id) {
        return ResponseEntity.ok(
                ingredientService.getIngredientById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<Ingredient>> getAllIngredients() {
        return ResponseEntity.ok(
                ingredientService.getAllIngredients()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.noContent().build();
    }
}

