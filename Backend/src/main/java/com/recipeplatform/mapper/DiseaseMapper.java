package com.recipeplatform.mapper;

import com.recipeplatform.domain.Disease;
import com.recipeplatform.domain.DiseaseStage;
import com.recipeplatform.dto.DiseaseDTO;
import com.recipeplatform.dto.DiseaseStageDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DiseaseMapper {

    @Mapping(target = "stages", source = "stages")
    DiseaseDTO toDTO(Disease disease);

    @Mapping(target = "stages", ignore = true)
    @Mapping(target = "foodRestrictions", ignore = true)
    Disease toEntity(DiseaseDTO dto);

    List<DiseaseDTO> toDTOList(List<Disease> diseases);

    @Mapping(target = "diseaseId", source = "disease.id")
    DiseaseStageDTO toStageDTO(DiseaseStage stage);

    @Mapping(target = "disease", ignore = true)
    DiseaseStage toStageEntity(DiseaseStageDTO dto);

    List<DiseaseStageDTO> toStageDTOList(List<DiseaseStage> stages);
}
