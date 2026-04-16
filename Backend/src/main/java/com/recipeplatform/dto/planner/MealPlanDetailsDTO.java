package com.recipeplatform.dto.planner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlanDetailsDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}
