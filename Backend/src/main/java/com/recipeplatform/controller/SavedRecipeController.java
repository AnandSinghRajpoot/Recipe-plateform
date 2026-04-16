package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.SavedRecipeDTO;
import com.recipeplatform.service.SavedRecipeService;
import com.recipeplatform.util.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/saved-recipes")
@RequiredArgsConstructor
public class SavedRecipeController {

    private final SavedRecipeService savedRecipeService;
    private final CurrentUser currentUser;

    @PostMapping("/{recipeId}")
    public ResponseEntity<ApiResponse<SavedRecipeDTO>> saveRecipe(@PathVariable Long recipeId) {
        Long userId = currentUser.getCurrentUser().getId();
        SavedRecipeDTO saved = savedRecipeService.saveRecipe(userId, recipeId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<SavedRecipeDTO>("Recipe saved successfully", saved, HttpStatus.CREATED.value()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SavedRecipeDTO>>> getSavedRecipes() {
        Long userId = currentUser.getCurrentUser().getId();
        List<SavedRecipeDTO> recipes = savedRecipeService.getSavedRecipes(userId);
        return ResponseEntity.ok(
                new ApiResponse<List<SavedRecipeDTO>>("Saved recipes retrieved", recipes, HttpStatus.OK.value()));
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<ApiResponse<Void>> removeSavedRecipe(@PathVariable Long recipeId) {
        Long userId = currentUser.getCurrentUser().getId();
        savedRecipeService.removeSavedRecipe(userId, recipeId);
        return ResponseEntity.ok(
                new ApiResponse<Void>("Recipe removed from saved list", null, HttpStatus.OK.value()));
    }
}
