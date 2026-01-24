package com.recipeplatform.controller;

import com.recipeplatform.dto.RecipeRequestDTO;
import com.recipeplatform.dto.RecipeResponseDTO;
import com.recipeplatform.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RecipeController {

    private final RecipeService recipeService;

    @PostMapping("/recipes")
    public ResponseEntity<RecipeResponseDTO> createRecipe(@Valid @RequestBody RecipeRequestDTO recipeDTO) {
        log.info("REST request to create recipe: {}", recipeDTO.getName());
        RecipeResponseDTO createdRecipe = recipeService.createRecipe(recipeDTO);
        return new ResponseEntity<>(createdRecipe, HttpStatus.CREATED);
    }

    @PutMapping("/recipes/{id}")
    public ResponseEntity<RecipeResponseDTO> updateRecipe(
            @PathVariable Long id,
            @Valid @RequestBody RecipeRequestDTO recipeDTO) {
        log.info("REST request to update recipe with id: {}", id);
        RecipeResponseDTO updatedRecipe = recipeService.updateRecipe(id, recipeDTO);
        return ResponseEntity.ok(updatedRecipe);
    }

    @DeleteMapping("/recipes/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        log.info("REST request to delete recipe with id: {}", id);
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<RecipeResponseDTO> getRecipeById(@PathVariable Long id) {
        log.info("REST request to get recipe with id: {}", id);
        RecipeResponseDTO recipe = recipeService.getRecipeById(id);
        return ResponseEntity.ok(recipe);
    }

    @GetMapping("/all-items")
    public ResponseEntity<List<RecipeResponseDTO>> getAllRecipes() {
        log.info("REST request to get all recipes");
        List<RecipeResponseDTO> recipes = recipeService.getAllRecipes();
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/recipes")
    public ResponseEntity<List<RecipeResponseDTO>> getRecipes(
            @RequestParam(required = false) String category) {
        log.info("REST request to get recipes by category: {}", category);

        if (category != null && !category.isEmpty()) {
            List<RecipeResponseDTO> recipes = recipeService.getRecipesByCategory(category);
            return ResponseEntity.ok(recipes);
        }

        List<RecipeResponseDTO> recipes = recipeService.getAllRecipes();
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/recipes/search")
    public ResponseEntity<List<RecipeResponseDTO>> searchRecipes(@RequestParam String q) {
        log.info("REST request to search recipes with query: {}", q);
        List<RecipeResponseDTO> recipes = recipeService.searchRecipes(q);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/recipes/latest")
    public ResponseEntity<List<RecipeResponseDTO>> getLatestRecipes() {
        log.info("REST request to get latest recipes");
        List<RecipeResponseDTO> recipes = recipeService.getLatestRecipes();
        return ResponseEntity.ok(recipes);
    }
}
