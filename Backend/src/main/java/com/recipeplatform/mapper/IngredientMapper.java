package com.recipeplatform.mapper;

import com.recipeplatform.domain.Ingredient;
import com.recipeplatform.dto.ingredient.IngredientRequestDto;
import com.recipeplatform.dto.ingredient.IngredientResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;


@Mapper(componentModel = "spring",unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IngredientMapper {

    Ingredient toEntity(IngredientRequestDto dto);

    IngredientResponseDto toDto(Ingredient ingredient);
//
//    List<IngredientDTO> toDTOList(List<Ingredient> ingredients);
}
