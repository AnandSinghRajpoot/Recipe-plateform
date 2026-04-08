package com.recipeplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDiseaseDTO {

    private Long id;
    private Long diseaseId;
    private String diseaseName;
    private Long stageId;
    private String stageName;
}
