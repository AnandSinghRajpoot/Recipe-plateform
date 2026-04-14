package com.recipeplatform.service;

import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeLike;
import com.recipeplatform.domain.User;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.repository.LikeRepository;
import com.recipeplatform.repository.RecipeRepository;
import com.recipeplatform.util.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final RecipeRepository recipeRepository;
    private final CurrentUser currentUser;

    @Transactional
    public void toggleLike(Long recipeId) {
        User user = currentUser.getCurrentUser();
        
        likeRepository.findByUserIdAndRecipeId(user.getId(), recipeId)
            .ifPresentOrElse(
                likeRepository::delete,
                () -> {
                    Recipe recipe = recipeRepository.findById(recipeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));
                    RecipeLike like = RecipeLike.builder()
                        .user(user)
                        .recipe(recipe)
                        .build();
                    likeRepository.save(like);
                }
            );
    }

    public boolean isLiked(Long recipeId) {
        User user = currentUser.getCurrentUser();
        if (user == null) return false;
        return likeRepository.existsByUserIdAndRecipeId(user.getId(), recipeId);
    }
}
