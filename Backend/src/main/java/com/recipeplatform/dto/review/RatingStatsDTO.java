package com.recipeplatform.dto.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingStatsDTO {
    private double averageRating;
    private long reviewCount;
}