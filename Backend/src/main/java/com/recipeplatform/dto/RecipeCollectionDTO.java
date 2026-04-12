package com.recipeplatform.dto;

import com.recipeplatform.dto.recipe.RecipeResponseDTO;
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
public class RecipeCollectionDTO {
    private Long id;
    private String name;
    private String description;
    private List<RecipeResponseDTO> recipes;
    private LocalDateTime createdAt;
}
