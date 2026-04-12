package com.recipeplatform.dto;

import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedRecipeDTO {
    private Long id;
    private Long recipeId;
    private RecipeResponseDTO recipe;
    private LocalDateTime savedAt;
}
