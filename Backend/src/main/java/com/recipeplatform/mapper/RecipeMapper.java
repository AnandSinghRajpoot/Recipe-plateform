package com.recipeplatform.mapper;

import com.recipeplatform.domain.Allergy;
import com.recipeplatform.domain.Disease;
import com.recipeplatform.domain.Recipe;
import com.recipeplatform.domain.RecipeIngredient;
import com.recipeplatform.domain.User;
import com.recipeplatform.dto.AuthorDto;
import com.recipeplatform.dto.recipe.RecipeRequestDto;
import com.recipeplatform.dto.recipe.RecipeResponseDTO;
import com.recipeplatform.dto.recipeIngredient.RecipeIngredientResponseDto;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {NutritionMapper.class})
public interface RecipeMapper {

    @Mapping(target = "ingredients", ignore = true)
    @Mapping(target = "containsAllergens", ignore = true)
    @Mapping(target = "safeForDiseases", ignore = true)
    Recipe toEntity(RecipeRequestDto dto);

    List<RecipeResponseDTO> toResponseDTOList(List<Recipe> recipes);

    @Mapping(target = "ingredients", ignore = true)
    @Mapping(target = "containsAllergens", ignore = true)
    @Mapping(target = "safeForDiseases", ignore = true)
    void updateEntityFromDTO(RecipeRequestDto dto, @MappingTarget Recipe recipe);

    @Mapping(target = "author", source = "user", qualifiedByName = "getAuthor")
    @Mapping(target = "ingredients", qualifiedByName = "getDto")
    @Mapping(target = "coverImageUrl", source = "coverImageUrl", qualifiedByName = "resolveUrl")
    @Mapping(target = "containsAllergens", qualifiedByName = "mapAllergenNames")
    @Mapping(target = "safeForDiseases", qualifiedByName = "mapDiseaseNames")
    @Mapping(target = "averageRating", source = "averageRating")
    @Mapping(target = "reviewCount", source = "reviewCount")
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
                        (i.getIngredient() != null) ? i.getIngredient().getName() : "Unknown Ingredient",
                        i.getQuantity(),
                        i.getUnit()))
                .collect(Collectors.toList());
    }

    @Named("getAuthor")
    default AuthorDto getAuthor(User user) {
        if (user == null) {
            return null;
        }
        String photo = user.getProfilePhoto();
        if (photo != null && !photo.startsWith("http")) {
            photo = "http://localhost:8080/images/" + photo;
        }
        return new AuthorDto(user.getId(), user.getName(), photo, user.getRole());
    }

    @Named("mapAllergenNames")
    default Set<String> mapAllergenNames(Set<Allergy> allergens) {
        if (allergens == null) return Set.of();
        return allergens.stream().map(Allergy::getName).collect(Collectors.toSet());
    }

    @Named("mapDiseaseNames")
    default Set<String> mapDiseaseNames(Set<Disease> diseases) {
        if (diseases == null) return Set.of();
        return diseases.stream().map(Disease::getName).collect(Collectors.toSet());
    }
}
