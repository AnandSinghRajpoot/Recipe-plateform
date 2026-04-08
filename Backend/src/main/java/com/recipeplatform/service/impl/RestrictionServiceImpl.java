package com.recipeplatform.service.impl;

import com.recipeplatform.domain.*;
import com.recipeplatform.dto.UserRestrictionsDTO;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.repository.*;
import com.recipeplatform.service.RestrictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RestrictionServiceImpl implements RestrictionService {

    private final UserHealthProfileRepository userHealthProfileRepository;
    private final AllergyRestrictionRepository allergyRestrictionRepository;
    private final DiseaseFoodRestrictionRepository diseaseFoodRestrictionRepository;

    @Override
    public UserRestrictionsDTO getAllRestrictionsForUser(Long userId) {
        UserHealthProfile profile = userHealthProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Health profile not found for user id: " + userId));

        // Get hard restrictions from allergies
        List<Long> allergyIds = profile.getAllergies().stream()
                .map(ua -> ua.getAllergy().getId())
                .collect(Collectors.toList());

        List<Long> hardRestrictedIngredientIds = new ArrayList<>();
        if (!allergyIds.isEmpty()) {
            hardRestrictedIngredientIds = allergyRestrictionRepository.findByAllergyIdIn(allergyIds)
                    .stream()
                    .map(ar -> ar.getIngredient().getId())
                    .distinct()
                    .collect(Collectors.toList());
        }

        // Get soft restrictions from diseases
        List<UserRestrictionsDTO.SoftRestriction> softRestrictions = new ArrayList<>();
        for (UserDisease userDisease : profile.getDiseases()) {
            List<DiseaseFoodRestriction> restrictions;

            if (userDisease.getStage() != null) {
                // Get stage-specific + general restrictions
                restrictions = diseaseFoodRestrictionRepository.findByDiseaseIdAndStageIdOrStageIsNull(
                        userDisease.getDisease().getId(),
                        userDisease.getStage().getId());
            } else {
                // Get only general restrictions (where stage is null)
                restrictions = diseaseFoodRestrictionRepository.findGeneralRestrictionsByDiseaseId(
                        userDisease.getDisease().getId());
            }

            for (DiseaseFoodRestriction restriction : restrictions) {
                softRestrictions.add(UserRestrictionsDTO.SoftRestriction.builder()
                        .ingredientId(restriction.getIngredient().getId())
                        .ingredientName(restriction.getIngredient().getName())
                        .severity(restriction.getSeverity())
                        .reason(restriction.getReason())
                        .build());
            }
        }

        return UserRestrictionsDTO.builder()
                .hardRestrictedIngredientIds(hardRestrictedIngredientIds)
                .softRestrictions(softRestrictions)
                .build();
    }
}
