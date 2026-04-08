package com.recipeplatform.mapper;

import com.recipeplatform.domain.UserAllergy;
import com.recipeplatform.domain.UserDisease;
import com.recipeplatform.domain.UserHealthProfile;
import com.recipeplatform.dto.UserAllergyDTO;
import com.recipeplatform.dto.UserDiseaseDTO;
import com.recipeplatform.dto.UserHealthProfileDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserHealthProfileMapper {

    @Mapping(target = "diseases", source = "diseases")
    @Mapping(target = "allergies", source = "allergies")
    UserHealthProfileDTO toDTO(UserHealthProfile profile);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "diseases", ignore = true)
    @Mapping(target = "allergies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    UserHealthProfile toEntity(UserHealthProfileDTO dto);

    @Mapping(target = "diseaseId", source = "disease.id")
    @Mapping(target = "diseaseName", source = "disease.name")
    @Mapping(target = "stageId", source = "stage.id")
    @Mapping(target = "stageName", source = "stage.stageName")
    UserDiseaseDTO toUserDiseaseDTO(UserDisease userDisease);

    List<UserDiseaseDTO> toUserDiseaseDTOList(List<UserDisease> userDiseases);

    @Mapping(target = "allergyId", source = "allergy.id")
    @Mapping(target = "allergyName", source = "allergy.name")
    UserAllergyDTO toUserAllergyDTO(UserAllergy userAllergy);

    List<UserAllergyDTO> toUserAllergyDTOList(List<UserAllergy> userAllergies);
}
