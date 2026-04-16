package com.recipeplatform.service;

import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeComment;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.AuthorDto;
import com.recipeplatform.dto.CommentRequestDto;
import com.recipeplatform.dto.CommentResponseDto;
import com.recipeplatform.exception.NotAllowedOperation;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.mapper.RecipeMapper;
import com.recipeplatform.repository.CommentRepository;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.util.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeMapper recipeMapper;
    private final CurrentUser currentUser;

    @Transactional
    public CommentResponseDto addComment(Long recipeId, CommentRequestDto dto) {
        User user = currentUser.getCurrentUser();
        Recipe recipe = recipeRepository.findById(recipeId)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));

        RecipeComment comment = RecipeComment.builder()
            .user(user)
            .recipe(recipe)
            .content(dto.getContent())
            .rating(dto.getRating())
            .build();

        comment = commentRepository.save(comment);

        // Recalculate recipe average rating and review count
        updateRecipeRating(recipe);

        return mapToResponseDto(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsByRecipe(Long recipeId) {
        return commentRepository.findByRecipeIdOrderByCreatedAtDesc(recipeId).stream()
            .map(this::mapToResponseDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId) {
        RecipeComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        User user = currentUser.getCurrentUser();
        if (!comment.getUser().getId().equals(user.getId()) &&
            !comment.getRecipe().getUser().getId().equals(user.getId())) {
            throw new NotAllowedOperation("Unauthorized to delete this comment");
        }

        Recipe recipe = comment.getRecipe();
        commentRepository.delete(comment);

        // Recalculate recipe average rating and review count
        updateRecipeRating(recipe);
    }

    private CommentResponseDto mapToResponseDto(RecipeComment comment) {
        AuthorDto author = new AuthorDto(
            comment.getUser().getId(),
            comment.getUser().getName(),
            recipeMapper.resolveUrl(comment.getUser().getProfilePhoto()),
            comment.getUser().getRole()
        );

        return CommentResponseDto.builder()
            .id(comment.getId())
            .content(comment.getContent())
            .author(author)
            .createdAt(comment.getCreatedAt())
            .rating(comment.getRating())
            .build();
    }

    private void updateRecipeRating(Recipe recipe) {
        List<RecipeComment> comments = commentRepository.findByRecipeIdOrderByCreatedAtDesc(recipe.getId());
        
        // Filter comments that have ratings
        List<RecipeComment> ratedComments = comments.stream()
            .filter(c -> c.getRating() != null && c.getRating() > 0)
            .collect(Collectors.toList());

        if (ratedComments.isEmpty()) {
            recipe.setAverageRating(0.0);
            recipe.setReviewCount(0L);
        } else {
            double sum = ratedComments.stream()
                .mapToInt(RecipeComment::getRating)
                .sum();
            recipe.setAverageRating(sum / ratedComments.size());
            recipe.setReviewCount((long) ratedComments.size());
        }

        recipeRepository.save(recipe);
    }
}
