package com.recipeplatform.service.impl;

import com.recipeplatform.domain.*;
import com.recipeplatform.dto.UserHealthProfileDTO;
import com.recipeplatform.exception.DuplicateResourceException;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.mapper.UserHealthProfileMapper;
import com.recipeplatform.repository.*;
import com.recipeplatform.service.UserHealthProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserHealthProfileServiceImpl implements UserHealthProfileService {

    private final UserHealthProfileRepository userHealthProfileRepository;
    private final UserRepository userRepository;
    private final DiseaseRepository diseaseRepository;
    private final DiseaseStageRepository diseaseStageRepository;
    private final AllergyRepository allergyRepository;
    private final UserDiseaseRepository userDiseaseRepository;
    private final UserAllergyRepository userAllergyRepository;
    private final UserHealthProfileMapper userHealthProfileMapper;

    @Override
    public UserHealthProfileDTO getProfileByUserId(Long userId) {
        return userHealthProfileRepository.findByUserId(userId)
                .map(userHealthProfileMapper::toDTO)
                .orElse(null);
    }

    @Override
    @Transactional
    public UserHealthProfileDTO createOrUpdateProfile(Long userId, UserHealthProfileDTO profileDTO) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserHealthProfile profile = userHealthProfileRepository.findByUserId(userId)
                .orElse(new UserHealthProfile());

        // Update profile fields
        profile.setUser(user);
        profile.setAge(profileDTO.getAge());
        profile.setGender(profileDTO.getGender());
        profile.setWeight(profileDTO.getWeight());
        profile.setHeight(profileDTO.getHeight());
        profile.setActivityLevel(profileDTO.getActivityLevel());

        UserHealthProfile savedProfile = userHealthProfileRepository.save(profile);
        return userHealthProfileMapper.toDTO(savedProfile);
    }

    @Override
    @Transactional
    public void addUserDisease(Long userId, Long diseaseId, Long stageId) {
        UserHealthProfile profile = userHealthProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Health profile not found for user id: " + userId));

        Disease disease = diseaseRepository.findById(diseaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Disease not found with id: " + diseaseId));

        // Check if already exists
        if (userDiseaseRepository.existsByUserHealthProfileIdAndDiseaseId(profile.getId(), diseaseId)) {
            throw new DuplicateResourceException("Disease already added to user's profile");
        }

        DiseaseStage stage = null;
        if (stageId != null) {
            stage = diseaseStageRepository.findById(stageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Disease stage not found with id: " + stageId));

            // Verify stage belongs to disease
            if (!stage.getDisease().getId().equals(diseaseId)) {
                throw new IllegalArgumentException("Stage does not belong to the specified disease");
            }
        }

        UserDisease userDisease = new UserDisease();
        userDisease.setUserHealthProfile(profile);
        userDisease.setDisease(disease);
        userDisease.setStage(stage);

        userDiseaseRepository.save(userDisease);
    }

    @Override
    @Transactional
    public void removeUserDisease(Long userId, Long diseaseId) {
        UserHealthProfile profile = userHealthProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Health profile not found for user id: " + userId));

        userDiseaseRepository.deleteByUserHealthProfileIdAndDiseaseId(profile.getId(), diseaseId);
    }

    @Override
    @Transactional
    public void addUserAllergy(Long userId, Long allergyId) {
        UserHealthProfile profile = userHealthProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Health profile not found for user id: " + userId));

        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + allergyId));

        // Check if already exists
        if (userAllergyRepository.existsByUserHealthProfileIdAndAllergyId(profile.getId(), allergyId)) {
            throw new DuplicateResourceException("Allergy already added to user's profile");
        }

        UserAllergy userAllergy = new UserAllergy();
        userAllergy.setUserHealthProfile(profile);
        userAllergy.setAllergy(allergy);

        userAllergyRepository.save(userAllergy);
    }

    @Override
    @Transactional
    public void removeUserAllergy(Long userId, Long allergyId) {
        UserHealthProfile profile = userHealthProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Health profile not found for user id: " + userId));

        userAllergyRepository.deleteByUserHealthProfileIdAndAllergyId(profile.getId(), allergyId);
    }

    @Override
    @Transactional
    public void deleteProfile(Long userId) {
        if (!userHealthProfileRepository.existsByUserId(userId)) {
            throw new ResourceNotFoundException("Health profile not found for user id: " + userId);
        }
        userHealthProfileRepository.deleteByUserId(userId);
    }
}
