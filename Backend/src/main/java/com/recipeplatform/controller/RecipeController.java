package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<RecipeResponseDTO>> createRecipe(@Valid @RequestBody RecipeRequestDto recipeDTO) {
        RecipeResponseDTO createdRecipe = recipeService.createRecipe(recipeDTO);

        ApiResponse<RecipeResponseDTO> response = new ApiResponse<>(
                "recipe added successfully",
                createdRecipe,
                HttpStatus.CREATED.value());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeResponseDTO>> updateRecipe(
            @PathVariable Long id,
            @Valid @RequestBody RecipeRequestDto recipeDTO) {
        RecipeResponseDTO updatedRecipe = recipeService.updateRecipe(id, recipeDTO);
        ApiResponse<RecipeResponseDTO> response = new ApiResponse<>(
                "recipe updated successfully",
                updatedRecipe,
                HttpStatus.OK.value());
        return new ResponseEntity<>(response, HttpStatus.OK);
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
    public ResponseEntity<ApiResponse<List<RecipeResponseDTO>>> getAllRecipes() {
        List<RecipeResponseDTO> recipes = recipeService.getAllRecipes();
        ApiResponse<List<RecipeResponseDTO>> response = new ApiResponse<>(
                "recipe fetched successfully",
                recipes,
                HttpStatus.OK.value());
        return new ResponseEntity<>(response, HttpStatus.OK);
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

    @GetMapping("/category/{category}")
    public ResponseEntity<List<RecipeResponseDTO>> getRecipesByCategory(@PathVariable String category) {
        List<RecipeResponseDTO> recipes = recipeService.getRecipesByCategory(category);
        return ResponseEntity.ok(recipes);
    }
}
