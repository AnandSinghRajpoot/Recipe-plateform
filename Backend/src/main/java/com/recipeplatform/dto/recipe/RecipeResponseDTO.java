package com.recipeplatform.dto.recipe;

import com.recipeplatform.dto.AuthorDto;
import com.recipeplatform.dto.recipeIngredient.RecipeIngredientResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String coverImageUrl;
    private String instructions;
    private List<RecipeIngredientResponseDto> ingredients;
    private Integer prepTime;
    private Integer cookTime;
    private AuthorDto author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
