package com.recipeplatform.dto.meal;

import com.recipeplatform.domain.enums.MealPlanGoal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanResponseDTO {
    private Long id;
    private String name;
    private String description;
    private MealPlanGoal goal;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<MealPlanDayDTO> days;
}
