package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recipes/{recipeId}/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<ApiResponse<Boolean>> toggleLike(@PathVariable Long recipeId) {
        likeService.toggleLike(recipeId);
        boolean liked = likeService.isLiked(recipeId);
        return ResponseEntity.ok(new ApiResponse<Boolean>(
            liked ? "Recipe liked" : "Recipe unliked",
            liked,
            200
        ));
    }
}
