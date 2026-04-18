package com.recipeplatform.mapper;

import com.recipeplatform.domain.Nutrition;
import com.recipeplatform.dto.recipe.NutritionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NutritionMapper {
    NutritionDTO toDTO(Nutrition nutrition);
    Nutrition toEntity(NutritionDTO dto);
    void updateEntityFromDTO(NutritionDTO dto, @MappingTarget Nutrition nutrition);
}
