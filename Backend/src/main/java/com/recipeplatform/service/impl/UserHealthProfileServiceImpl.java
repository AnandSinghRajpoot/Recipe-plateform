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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.recipeplatform.exception.ResourceNotFoundException("User not found with id: " + userId));

        return userHealthProfileRepository.findByUserId(userId)
                .map(profile -> {
                    UserHealthProfileDTO dto = userHealthProfileMapper.toDTO(profile);
                    dto.setCompletionPercentage(calculateCompletion(profile));
                    return dto;
                })
                .orElseGet(() -> {
                    // Profile record doesn't exist in DB yet, but we still calculate completion for the User fields
                    UserHealthProfile tempProfile = new UserHealthProfile();
                    tempProfile.setUser(user);
                    UserHealthProfileDTO dto = new UserHealthProfileDTO();
                    dto.setCompletionPercentage(calculateCompletion(tempProfile));
                    return dto;
                });
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
        profile.setWorkType(profileDTO.getWorkType());
        profile.setTravelFrequency(profileDTO.getTravelFrequency());
        profile.setEatingPattern(profileDTO.getEatingPattern());
        profile.setSleepDuration(profileDTO.getSleepDuration());
        profile.setWaterIntakeGlasses(profileDTO.getWaterIntakeGlasses());
        profile.setSmokingHabit(profileDTO.getSmokingHabit());
        profile.setAlcoholHabit(profileDTO.getAlcoholHabit());

        UserHealthProfile savedProfile = userHealthProfileRepository.save(profile);

        // Sync Allergies
        if (profileDTO.getAllergies() != null) {
            userAllergyRepository.deleteByUserHealthProfileId(savedProfile.getId());
            for (com.recipeplatform.dto.UserAllergyDTO allergyDto : profileDTO.getAllergies()) {
                Allergy allergy = allergyRepository.findById(allergyDto.getAllergyId())
                        .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + allergyDto.getAllergyId()));
                UserAllergy ua = new UserAllergy();
                ua.setUserHealthProfile(savedProfile);
                ua.setAllergy(allergy);
                userAllergyRepository.save(ua);
            }
        }

        // Sync Diseases
        if (profileDTO.getDiseases() != null) {
            userDiseaseRepository.deleteByUserHealthProfileId(savedProfile.getId());
            for (com.recipeplatform.dto.UserDiseaseDTO diseaseDto : profileDTO.getDiseases()) {
                Disease disease = diseaseRepository.findById(diseaseDto.getDiseaseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Disease not found with id: " + diseaseDto.getDiseaseId()));
                
                DiseaseStage stage = null;
                if (diseaseDto.getStageId() != null) {
                    stage = diseaseStageRepository.findById(diseaseDto.getStageId())
                            .orElse(null);
                }

                UserDisease ud = new UserDisease();
                ud.setUserHealthProfile(savedProfile);
                ud.setDisease(disease);
                ud.setStage(stage);
                userDiseaseRepository.save(ud);
            }
        }

        UserHealthProfileDTO savedDto = userHealthProfileMapper.toDTO(savedProfile);
        savedDto.setCompletionPercentage(calculateCompletion(savedProfile));
        return savedDto;
    }

    private Integer calculateCompletion(UserHealthProfile profile) {
        if (profile == null) return 0;
        int filledFields = 0;
        int totalFields = 17; // 12 health + 5 general

        // 1. Health Fields (UserHealthProfile)
        if (profile.getAge() != null) filledFields++;
        if (profile.getGender() != null) filledFields++;
        if (profile.getWeight() != null) filledFields++;
        if (profile.getHeight() != null) filledFields++;
        if (profile.getActivityLevel() != null) filledFields++;
        if (profile.getWorkType() != null) filledFields++;
        if (profile.getTravelFrequency() != null) filledFields++;
        if (profile.getEatingPattern() != null) filledFields++;
        if (profile.getSleepDuration() != null) filledFields++;
        if (profile.getWaterIntakeGlasses() != null) filledFields++;
        if (profile.getSmokingHabit() != null) filledFields++;
        if (profile.getAlcoholHabit() != null) filledFields++;

        // 2. Account Fields (User)
        User user = profile.getUser();
        if (user != null) {
            if (user.getName() != null && !user.getName().isBlank()) filledFields++;
            if (user.getProfilePhoto() != null && !user.getProfilePhoto().contains("general-profile-pic")) filledFields++;
            if (user.getBio() != null && !user.getBio().isBlank()) filledFields++;
            if (user.getDietType() != null) filledFields++;
            if (user.getSkillLevel() != null) filledFields++;
        }

        return (filledFields * 100) / totalFields;
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
