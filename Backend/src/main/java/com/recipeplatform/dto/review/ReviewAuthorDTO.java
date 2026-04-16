package com.recipeplatform.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewAuthorDTO {

    private Long id;
    private String name;
    private String profilePhoto;
    private String role;
}