package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.CommentRequestDto;
import com.recipeplatform.dto.CommentResponseDto;
import com.recipeplatform.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recipes/{recipeId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponseDto>> addComment(
            @PathVariable Long recipeId,
            @Valid @RequestBody CommentRequestDto dto) {
        CommentResponseDto comment = commentService.addComment(recipeId, dto);
        return ResponseEntity.ok(new ApiResponse<CommentResponseDto>("Comment added", comment, 201));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponseDto>>> getComments(@PathVariable Long recipeId) {
        List<CommentResponseDto> comments = commentService.getCommentsByRecipe(recipeId);
        return ResponseEntity.ok(new ApiResponse<List<CommentResponseDto>>("Comments fetched", comments, 200));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok(new ApiResponse<Void>("Comment deleted", null, 200));
    }
}
