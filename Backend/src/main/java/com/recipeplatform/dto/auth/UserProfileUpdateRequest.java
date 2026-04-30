package com.recipeplatform.dto.auth;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    @jakarta.validation.constraints.Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @jakarta.validation.constraints.Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format (10-15 digits)")
    private String phoneNumber;

    @jakarta.validation.constraints.Size(min = 50, max = 500, message = "Bio must be between 50 and 500 characters")
    private String bio;

    private com.recipeplatform.domain.enums.DietType dietType;
    private com.recipeplatform.domain.enums.SkillLevel skillLevel;
    private java.util.List<String> specializations;

    @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://)?(www\\.)?instagram\\.com/[A-Za-z0-9_.]+/?$", message = "Invalid Instagram URL format")
    private String instagramLink;

    @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$", message = "Invalid YouTube URL format")
    private String youtubeLink;

    @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$", message = "Invalid Website URL format")
    private String websiteLink;
    private String contentIntent;
}
