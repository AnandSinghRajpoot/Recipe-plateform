package com.recipeplatform.mapper;

import com.recipeplatform.domain.Allergy;
import com.recipeplatform.dto.AllergyDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AllergyMapper {

    AllergyDTO toDTO(Allergy allergy);

    @Mapping(target = "restrictions", ignore = true)
    Allergy toEntity(AllergyDTO dto);

    List<AllergyDTO> toDTOList(List<Allergy> allergies);
}
