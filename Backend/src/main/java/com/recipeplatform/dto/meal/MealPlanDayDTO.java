package com.recipeplatform.dto.meal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanDayDTO {
    private Long id;
    private DayOfWeek dayOfWeek;
    private List<MealSlotDTO> slots;
}
