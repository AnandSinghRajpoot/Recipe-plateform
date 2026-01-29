package com.recipeplatform.controller;


import com.recipeplatform.dto.recipe.*;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "api/v1/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping
    public ResponseEntity<RecipeResponseDTO> createRecipe(@Valid @RequestBody RecipeRequestDto recipeDTO) {
        RecipeResponseDTO createdRecipe = recipeService.createRecipe(recipeDTO);
        return new ResponseEntity<>(createdRecipe, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipeResponseDTO> updateRecipe(
            @PathVariable Long id,
            @Valid @RequestBody RecipeRequestDto recipeDTO) {
        RecipeResponseDTO updatedRecipe = recipeService.updateRecipe(id, recipeDTO);
        return ResponseEntity.ok(updatedRecipe);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponseDTO> getRecipeById(@PathVariable Long id) {
        RecipeResponseDTO recipe = recipeService.getRecipeById(id);
        return ResponseEntity.ok(recipe);
    }

    @GetMapping
    public ResponseEntity<List<RecipeResponseDTO>> getAllRecipes() {
        List<RecipeResponseDTO> recipes = recipeService.getAllRecipes();
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/search")
    public ResponseEntity<List<RecipeResponseDTO>> searchRecipes(@RequestParam String q) {
        List<RecipeResponseDTO> recipes = recipeService.searchRecipes(q);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/latest")
    public ResponseEntity<List<RecipeResponseDTO>> getLatestRecipes() {
        List<RecipeResponseDTO> recipes = recipeService.getLatestRecipes();
        return ResponseEntity.ok(recipes);
    }
}
