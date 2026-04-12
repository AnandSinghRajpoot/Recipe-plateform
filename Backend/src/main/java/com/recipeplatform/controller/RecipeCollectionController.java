package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.RecipeCollectionDTO;
import com.recipeplatform.service.RecipeCollectionService;
import com.recipeplatform.util.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
public class RecipeCollectionController {

    private final RecipeCollectionService collectionService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<ApiResponse<RecipeCollectionDTO>> createCollection(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");
        Long userId = currentUser.getCurrentUser().getId();
        RecipeCollectionDTO collection = collectionService.createCollection(userId, name, description);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("Collection created", collection, HttpStatus.CREATED.value()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecipeCollectionDTO>>> getMyCollections() {
        Long userId = currentUser.getCurrentUser().getId();
        List<RecipeCollectionDTO> collections = collectionService.getUserCollections(userId);
        return ResponseEntity.ok(
                new ApiResponse<>("Collections retrieved", collections, HttpStatus.OK.value()));
    }

    @PostMapping("/{collectionId}/recipes/{recipeId}")
    public ResponseEntity<ApiResponse<RecipeCollectionDTO>> addRecipeToCollection(
            @PathVariable Long collectionId,
            @PathVariable Long recipeId) {
        Long userId = currentUser.getCurrentUser().getId();
        RecipeCollectionDTO updated = collectionService.addRecipeToCollection(collectionId, recipeId, userId);
        return ResponseEntity.ok(
                new ApiResponse<>("Recipe added to collection", updated, HttpStatus.OK.value()));
    }

    @DeleteMapping("/{collectionId}")
    public ResponseEntity<ApiResponse<Void>> deleteCollection(@PathVariable Long collectionId) {
        Long userId = currentUser.getCurrentUser().getId();
        collectionService.deleteCollection(collectionId, userId);
        return ResponseEntity.ok(
                new ApiResponse<>("Collection deleted", null, HttpStatus.OK.value()));
    }
}
