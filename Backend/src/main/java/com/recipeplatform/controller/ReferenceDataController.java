package com.recipeplatform.controller;

import com.recipeplatform.domain.enums.DietType;
import com.recipeplatform.domain.enums.MealType;
import com.recipeplatform.dto.AllergyDTO;
import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.DiseaseDTO;
import com.recipeplatform.service.AllergyService;
import com.recipeplatform.service.DiseaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

/**
 * Public reference data endpoint — no authentication required.
 * Used by the frontend profile wizard and Chef upload form to
 * dynamically load diseases, allergies, and enum options.
 *
 * Maps to /api/v1/reference/**  (PRD §5.3)
 */
@RestController
@RequestMapping("/api/v1/reference")
@RequiredArgsConstructor
public class ReferenceDataController {

    private final DiseaseService diseaseService;
    private final AllergyService allergyService;

    /**
     * GET /api/v1/reference/diseases
     * Returns all seeded diseases for the multi-select chip picker.
     */
    @GetMapping("/diseases")
    public ResponseEntity<ApiResponse<List<DiseaseDTO>>> getDiseases() {
        return ResponseEntity.ok(
            new ApiResponse<>("Diseases retrieved", diseaseService.getAllDiseases(), HttpStatus.OK.value()));
    }

    /**
     * GET /api/v1/reference/allergies
     * Returns all seeded allergies for the multi-select chip picker.
     */
    @GetMapping("/allergies")
    public ResponseEntity<ApiResponse<List<AllergyDTO>>> getAllergies() {
        return ResponseEntity.ok(
            new ApiResponse<>("Allergies retrieved", allergyService.getAllAllergies(), HttpStatus.OK.value()));
    }

    /**
     * GET /api/v1/reference/diet-types
     * Returns DietType enum values as strings.
     */
    @GetMapping("/diet-types")
    public ResponseEntity<ApiResponse<List<String>>> getDietTypes() {
        List<String> values = Arrays.stream(DietType.values()).map(Enum::name).toList();
        return ResponseEntity.ok(
            new ApiResponse<>("Diet types retrieved", values, HttpStatus.OK.value()));
    }

    /**
     * GET /api/v1/reference/meal-types
     * Returns MealType enum values as strings.
     */
    @GetMapping("/meal-types")
    public ResponseEntity<ApiResponse<List<String>>> getMealTypes() {
        List<String> values = Arrays.stream(MealType.values()).map(Enum::name).toList();
        return ResponseEntity.ok(
            new ApiResponse<>("Meal types retrieved", values, HttpStatus.OK.value()));
    }
}
