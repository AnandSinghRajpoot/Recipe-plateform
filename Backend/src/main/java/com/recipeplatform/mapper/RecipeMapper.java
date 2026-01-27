//package com.recipeplatform.mapper;
//
//import com.recipeplatform.domain.Recipe;
//import com.recipeplatform.dto.RecipeRequestDTO;
//import com.recipeplatform.dto.RecipeResponseDTO;
//import org.mapstruct.Mapper;
//import org.mapstruct.Mapping;
//import org.mapstruct.MappingTarget;
//
//import java.util.List;
//
//@Mapper(componentModel = "spring", uses = { IngredientMapper.class, CategoryMapper.class })
//public interface RecipeMapper {
//
//    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "createdAt", ignore = true)
//    @Mapping(target = "updatedAt", ignore = true)
//    @Mapping(target = "category", ignore = true)
//    Recipe toEntity(RecipeRequestDTO dto);
//
//    RecipeResponseDTO toResponseDTO(Recipe recipe);
//
//    List<RecipeResponseDTO> toResponseDTOList(List<Recipe> recipes);
//
//    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "createdAt", ignore = true)
//    @Mapping(target = "updatedAt", ignore = true)
//    @Mapping(target = "category", ignore = true)
//    void updateEntityFromDTO(RecipeRequestDTO dto, @MappingTarget Recipe recipe);
//}
