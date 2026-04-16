package com.recipeplatform.controller;

import com.recipeplatform.dto.AllergyDTO;
import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.DiseaseDTO;
import com.recipeplatform.dto.DiseaseStageDTO;
import com.recipeplatform.service.AllergyService;
import com.recipeplatform.service.DiseaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master")
@RequiredArgsConstructor
public class MasterDataController {

        private final DiseaseService diseaseService;
        private final AllergyService allergyService;

    // ==================== Disease Endpoints ====================

    @GetMapping("/diseases")
    public ResponseEntity<ApiResponse<List<DiseaseDTO>>> getAllDiseases() {
        List<DiseaseDTO> diseases = diseaseService.getAllDiseases();
        return ResponseEntity.ok(
                new ApiResponse<List<DiseaseDTO>>("Diseases retrieved successfully", diseases, HttpStatus.OK.value()));
    }

    @GetMapping("/diseases/{id}")
    public ResponseEntity<ApiResponse<DiseaseDTO>> getDiseaseById(@PathVariable Long id) {
        DiseaseDTO disease = diseaseService.getDiseaseById(id);
        return ResponseEntity.ok(
                new ApiResponse<DiseaseDTO>("Disease retrieved successfully", disease, HttpStatus.OK.value()));
    }

    @GetMapping("/diseases/{id}/stages")
    public ResponseEntity<ApiResponse<List<DiseaseStageDTO>>> getStagesByDiseaseId(@PathVariable Long id) {
        List<DiseaseStageDTO> stages = diseaseService.getStagesByDiseaseId(id);
        return ResponseEntity.ok(
                new ApiResponse<List<DiseaseStageDTO>>("Disease stages retrieved successfully", stages,
                        HttpStatus.OK.value()));
    }

    @PostMapping("/diseases")
    public ResponseEntity<ApiResponse<DiseaseDTO>> createDisease(@Valid @RequestBody DiseaseDTO diseaseDTO) {
        DiseaseDTO createdDisease = diseaseService.createDisease(diseaseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<DiseaseDTO>("Disease created successfully", createdDisease,
                        HttpStatus.CREATED.value()));
    }

    @PutMapping("/diseases/{id}")
    public ResponseEntity<ApiResponse<DiseaseDTO>> updateDisease(@PathVariable Long id, @Valid @RequestBody DiseaseDTO diseaseDTO) {
        DiseaseDTO updatedDisease = diseaseService.updateDisease(id, diseaseDTO);
        return ResponseEntity.ok(
                new ApiResponse<DiseaseDTO>("Disease updated successfully", updatedDisease,
                        HttpStatus.OK.value()));
    }

    @DeleteMapping("/diseases/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDisease(@PathVariable Long id) {
        diseaseService.deleteDisease(id);
        return ResponseEntity.ok(
                new ApiResponse<Void>("Disease deleted successfully", null, HttpStatus.OK.value()));
    }

    // ==================== Allergy Endpoints ====================

    @GetMapping("/allergies")
    public ResponseEntity<ApiResponse<List<AllergyDTO>>> getAllergies() {
        List<AllergyDTO> allergies = allergyService.getAllAllergies();
        return ResponseEntity.ok(
                new ApiResponse<List<AllergyDTO>>("Allergies retrieved successfully", allergies,
                        HttpStatus.OK.value()));
    }

    @GetMapping("/allergies/{id}")
    public ResponseEntity<ApiResponse<AllergyDTO>> getAllergyById(@PathVariable Long id) {
        AllergyDTO allergy = allergyService.getAllergyById(id);
        return ResponseEntity.ok(
                new ApiResponse<AllergyDTO>("Allergy retrieved successfully", allergy, HttpStatus.OK.value()));
    }

    @PostMapping("/allergies")
    public ResponseEntity<ApiResponse<AllergyDTO>> createAllergy(@Valid @RequestBody AllergyDTO allergyDTO) {
        AllergyDTO createdAllergy = allergyService.createAllergy(allergyDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<AllergyDTO>("Allergy created successfully", createdAllergy,
                        HttpStatus.CREATED.value()));
    }

    @PutMapping("/allergies/{id}")
    public ResponseEntity<ApiResponse<AllergyDTO>> updateAllergy(@PathVariable Long id, @Valid @RequestBody AllergyDTO allergyDTO) {
        AllergyDTO updatedAllergy = allergyService.updateAllergy(id, allergyDTO);
        return ResponseEntity.ok(
                new ApiResponse<AllergyDTO>("Allergy updated successfully", updatedAllergy,
                        HttpStatus.OK.value()));
    }

    @DeleteMapping("/allergies/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAllergy(@PathVariable Long id) {
        allergyService.deleteAllergy(id);
        return ResponseEntity.ok(
                new ApiResponse<Void>("Allergy deleted successfully", null, HttpStatus.OK.value()));
    }
}
