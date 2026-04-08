package com.recipeplatform.service.impl;

import com.recipeplatform.domain.User;
import com.recipeplatform.domain.UserHealthProfile;
import com.recipeplatform.domain.UserDisease;
import com.recipeplatform.domain.UserAllergy;
import com.recipeplatform.domain.enums.UserRole;
import com.recipeplatform.dto.auth.LoginRequest;
import com.recipeplatform.dto.auth.LoginResponse;
import com.recipeplatform.dto.auth.RegisterRequest;
import com.recipeplatform.exception.UserAlreadyExistException;
import com.recipeplatform.mapper.UserMapper;
import com.recipeplatform.repository.AllergyRepository;
import com.recipeplatform.repository.UserRepository;
import com.recipeplatform.repository.UserHealthProfileRepository;
import com.recipeplatform.repository.DiseaseRepository;
import com.recipeplatform.security.JwtUtill;
import com.recipeplatform.service.AuthService;
import com.recipeplatform.service.EmailService;
import com.recipeplatform.service.ImageService;
import com.recipeplatform.util.CurrentUser;
import com.recipeplatform.util.ProfileCompletionHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;

@Service
public class AuthServiceImpl implements AuthService {

    private final JwtUtill jwtUtill;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private final CurrentUser currentUser;
    private final UserHealthProfileRepository userHealthProfileRepository;
    private final DiseaseRepository diseaseRepository;
    private final AllergyRepository allergyRepository;
    private final ImageService imageService;
    private final EmailService emailService;

    public AuthServiceImpl(JwtUtill jwtUtill, PasswordEncoder passwordEncoder, UserRepository userRepository,
            UserMapper userMapper, AuthenticationManager authenticationManager, CurrentUser currentUser,
            UserHealthProfileRepository userHealthProfileRepository, DiseaseRepository diseaseRepository, 
            AllergyRepository allergyRepository, ImageService imageService, EmailService emailService) {
        this.jwtUtill = jwtUtill;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.currentUser = currentUser;
        this.userHealthProfileRepository = userHealthProfileRepository;
        this.diseaseRepository = diseaseRepository;
        this.allergyRepository = allergyRepository;
        this.imageService = imageService;
        this.emailService = emailService;
    }

    public LoginResponse login(LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = jwtUtill.generateToken(authentication.getName());
        com.recipeplatform.security.CustomUserDetails userDetails = (com.recipeplatform.security.CustomUserDetails) authentication
                .getPrincipal();
        User user = userDetails.getUser();
        return new LoginResponse(
                accessToken, jwtUtill.extractClaims(accessToken).getIssuedAt().getTime(),
                jwtUtill.extractClaims(accessToken).getExpiration().getTime(), 
                user.getIsProfileCompleted(),
                user.getRole());

    }

    public User register(RegisterRequest registerRequest, MultipartFile profilePhoto) {
        // 1. Password Confirmation Check
        if (registerRequest.getConfirmPassword() != null && 
            !registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match.");
        }

        User user = userMapper.toEntity(registerRequest);
        
        // 2. Role Handling
        UserRole role = registerRequest.getRole() != null ? registerRequest.getRole() : UserRole.USER;
        user.setRole(role);
        
        // 3. Chef-specific Mandatory Validations
        if (role == UserRole.CHEF) {
            if (registerRequest.getPhoneNumber() == null || registerRequest.getPhoneNumber().isBlank()) {
                throw new RuntimeException("Phone number is required for Chef registration.");
            }
        }

        // 4. Map Specialized Fields
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        
        // Save profile photo if provided
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            String photoName = imageService.saveImage(profilePhoto);
            user.setProfilePhoto(photoName);
        } else {
            user.setProfilePhoto(registerRequest.getProfilePhoto());
        }

        user.setSpecializations(registerRequest.getSpecializations());
        user.setExperienceLevel(registerRequest.getExperienceLevel());
        user.setBio(registerRequest.getBio());
        user.setInstagramLink(registerRequest.getInstagramLink());
        user.setYoutubeLink(registerRequest.getYoutubeLink());
        user.setWebsiteLink(registerRequest.getWebsiteLink());
        user.setContentIntent(registerRequest.getContentIntent());
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        ProfileCompletionHelper.initialize(user);

        if(userRepository.existsByEmail(user.getEmail())){
            throw new UserAlreadyExistException("User already exists with this email.");
        }
        
        User savedUser = userRepository.save(user);
        
        // Send welcome email asynchronously (won't block registration response)
        new Thread(() -> {
            try {
                emailService.sendWelcomeEmail(savedUser);
            } catch (Exception e) {
                System.err.println("Welcome email could not be sent: " + e.getMessage());
            }
        }).start();
        
        return savedUser;
    }

    @Override
    public String completeProfile(com.recipeplatform.dto.auth.ProfileCompletionRequest request) {
        User user = currentUser.getCurrentUser();
        
        // Update basic user preferences
        if (request.getDietType() != null) user.setDietType(request.getDietType());
        if (request.getSkillLevel() != null) user.setSkillLevel(request.getSkillLevel());
        ProfileCompletionHelper.completeProfile(user);
        userRepository.save(user);

        // Fetch or create Health Profile
        UserHealthProfile profile = userHealthProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserHealthProfile newProfile = new UserHealthProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        // Set properties from request
        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setWeight(request.getWeight());
        profile.setHeight(request.getHeight());
        profile.setActivityLevel(request.getActivityLevel());

        profile.setWorkType(request.getWorkType());
        profile.setTravelFrequency(request.getTravelFrequency());
        profile.setEatingPattern(request.getEatingPattern());
        profile.setSleepDuration(request.getSleepDuration());
        profile.setWaterIntakeGlasses(request.getWaterIntakeGlasses());
        profile.setSmokingHabit(request.getSmokingHabit());
        profile.setAlcoholHabit(request.getAlcoholHabit());

        // Calculate BMI
        if (request.getWeight() != null && request.getHeight() != null && request.getHeight() > 0) {
            double heightInM = request.getHeight() / 100.0;
            profile.setBmi(request.getWeight() / (heightInM * heightInM));
        }

        // Calculate Daily Calorie Requirement
        if (request.getAge() != null && request.getGender() != null && request.getWeight() != null && request.getHeight() != null) {
            double bmr = (10 * request.getWeight()) + (6.25 * request.getHeight()) - (5 * request.getAge());
            if (request.getGender() == com.recipeplatform.domain.enums.Gender.MALE) {
                bmr += 5;
            } else {
                bmr -= 161;
            }
            double multiplier = 1.2;
            if (request.getActivityLevel() != null) {
                switch(request.getActivityLevel()) {
                    case LIGHTLY_ACTIVE: multiplier = 1.375; break;
                    case MODERATELY_ACTIVE: multiplier = 1.55; break;
                    case VERY_ACTIVE: multiplier = 1.725; break;
                    case EXTREMELY_ACTIVE: multiplier = 1.9; break;
                    default: multiplier = 1.2;
                }
            }
            profile.setDailyCalorieRequirement(bmr * multiplier);
        }

        // Map Diseases
        profile.getDiseases().clear();
        if (request.getDiseaseNames() != null) {
            for (String dName : request.getDiseaseNames()) {
                diseaseRepository.findByName(dName).ifPresent(disease -> {
                    UserDisease ud = new UserDisease();
                    ud.setDisease(disease);
                    ud.setUserHealthProfile(profile);
                    profile.getDiseases().add(ud);
                });
            }
        }

        // Map Allergies
        profile.getAllergies().clear();
        if (request.getAllergyNames() != null) {
            for (String aName : request.getAllergyNames()) {
                allergyRepository.findByName(aName).ifPresent(allergy -> {
                    UserAllergy ua = new UserAllergy();
                    ua.setAllergy(allergy);
                    ua.setUserHealthProfile(profile);
                    profile.getAllergies().add(ua);
                });
            }
        }

        userHealthProfileRepository.save(profile);

        return "profile completed successfully";
    }
}
