package com.recipeplatform.mapper;

import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeIngredient;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.AuthorDto;
import com.recipeplatform.dto.recipe.RecipeRequestDto;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.dto.recipeIngredient.RecipeIngredientResponseDto;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RecipeMapper {

    Recipe toEntity(RecipeRequestDto dto);

    List<RecipeResponseDTO> toResponseDTOList(List<Recipe> recipes);

    void updateEntityFromDTO(RecipeRequestDto dto, @MappingTarget Recipe recipe);

    @Mapping(target = "author", source = "user", qualifiedByName = "getAuthor")
    @Mapping(target = "ingredients", qualifiedByName = "getDto")
    @Mapping(target = "coverImageUrl", source = "coverImageUrl", qualifiedByName = "resolveUrl")
    RecipeResponseDTO toResponseDTO(Recipe recipe);

    @Named("resolveUrl")
    default String resolveUrl(String coverImageUrl) {
        if (coverImageUrl == null || coverImageUrl.startsWith("http")) {
            return coverImageUrl;
        }
        return "http://localhost:8080/images/" + coverImageUrl;
    }

    @Named("getDto")
    default List<RecipeIngredientResponseDto> getDto(List<RecipeIngredient> ingredients) {
        if (ingredients == null)
            return null;
        return ingredients.stream()
                .map(i -> new RecipeIngredientResponseDto(
                        i.getId(),
                        i.getIngredient().getName(),
                        i.getQuantity(),
                        i.getUnit()))
                .collect(Collectors.toList());
    }

    @Named("getAuthor")
    default AuthorDto getAuthor(User user) {
        if (user == null) {
            return null;
        }
        return new AuthorDto(user.getId(), user.getRole());
    }

}
