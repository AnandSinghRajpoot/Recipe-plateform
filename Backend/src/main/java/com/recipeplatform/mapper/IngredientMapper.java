package com.recipeplatform.mapper;

import com.recipeplatform.domain.Ingredient;
import com.recipeplatform.dto.IngredientDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface IngredientMapper {

    @Mapping(target = "recipe", ignore = true)
    Ingredient toEntity(IngredientDTO dto);

    IngredientDTO toDTO(Ingredient ingredient);

    List<IngredientDTO> toDTOList(List<Ingredient> ingredients);
}
