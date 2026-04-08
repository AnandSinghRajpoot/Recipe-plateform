package com.recipeplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseDTO {

    private Long id;
    private String name;
    private String description;
    private Boolean hasStages;

    @Builder.Default
    private List<DiseaseStageDTO> stages = new ArrayList<>();
}
