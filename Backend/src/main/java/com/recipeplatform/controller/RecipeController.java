package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.recipe.*;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping(path = "api/v1/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RecipeResponseDTO>> createRecipe(
            @RequestPart(value = "recipe") @Valid RecipeRequestDto recipeDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        RecipeResponseDTO createdRecipe = recipeService.createRecipe(recipeDTO, file);

        ApiResponse<RecipeResponseDTO> response = new ApiResponse<>(
                "recipe added successfully",
                createdRecipe,
                HttpStatus.CREATED.value());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RecipeResponseDTO>> updateRecipe(
            @PathVariable Long id,
            @RequestPart(value = "recipe") @Valid RecipeRequestDto recipeDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        RecipeResponseDTO updatedRecipe = recipeService.updateRecipe(id, recipeDTO, file);
        ApiResponse<RecipeResponseDTO> response = new ApiResponse<>(
                "recipe updated successfully",
                updatedRecipe,
                HttpStatus.OK.value());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        ApiResponse<Void> response = new ApiResponse<>(
                "recipe deleted successfully",
                null,
                HttpStatus.OK.value());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeResponseDTO>> getRecipeById(@PathVariable Long id) {
        RecipeResponseDTO recipe = recipeService.getRecipeById(id);
        ApiResponse<RecipeResponseDTO> response = new ApiResponse<>(
                "recipe detail fetched successfully",
                recipe,
                HttpStatus.OK.value());
        return ResponseEntity.ok(response);
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
    public ResponseEntity<ApiResponse<List<RecipeResponseDTO>>> searchRecipes(@RequestParam String q) {
        List<RecipeResponseDTO> recipes = recipeService.searchRecipes(q);
        ApiResponse<List<RecipeResponseDTO>> response = new ApiResponse<>(
                "recipe searched successfully",
                recipes,
                HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<RecipeResponseDTO>>> getLatestRecipes() {
        List<RecipeResponseDTO> recipes = recipeService.getLatestRecipes();
        ApiResponse<List<RecipeResponseDTO>> response = new ApiResponse<>(
                "latest recipes fetched successfully",
                recipes,
                HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-recipes")
    public ResponseEntity<ApiResponse<List<RecipeResponseDTO>>> getMyRecipes() {
        List<RecipeResponseDTO> recipes = recipeService.getMyRecipes();
        ApiResponse<List<RecipeResponseDTO>> response = new ApiResponse<>(
                "my recipes fetched successfully",
                recipes,
                HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<RecipeResponseDTO>>> getRecipesByCategory(@PathVariable String category) {
        List<RecipeResponseDTO> recipes = recipeService.getRecipesByCategory(category);
        ApiResponse<List<RecipeResponseDTO>> response = new ApiResponse<>(
                "category recipes fetched successfully",
                recipes,
                HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
}
