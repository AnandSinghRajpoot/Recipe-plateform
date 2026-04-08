package com.recipeplatform.service.impl;

import com.recipeplatform.domain.Disease;
import com.recipeplatform.dto.DiseaseDTO;
import com.recipeplatform.dto.DiseaseStageDTO;
import com.recipeplatform.exception.DuplicateResourceException;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.mapper.DiseaseMapper;
import com.recipeplatform.repository.DiseaseRepository;
import com.recipeplatform.repository.DiseaseStageRepository;
import com.recipeplatform.service.DiseaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiseaseServiceImpl implements DiseaseService {

    private final DiseaseRepository diseaseRepository;
    private final DiseaseStageRepository diseaseStageRepository;
    private final DiseaseMapper diseaseMapper;

    @Override
    public List<DiseaseDTO> getAllDiseases() {
        return diseaseMapper.toDTOList(diseaseRepository.findAll());
    }

    @Override
    public DiseaseDTO getDiseaseById(Long id) {
        Disease disease = diseaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disease not found with id: " + id));
        return diseaseMapper.toDTO(disease);
    }

    @Override
    public List<DiseaseStageDTO> getStagesByDiseaseId(Long diseaseId) {
        // Verify disease exists
        if (!diseaseRepository.existsById(diseaseId)) {
            throw new ResourceNotFoundException("Disease not found with id: " + diseaseId);
        }
        return diseaseMapper.toStageDTOList(
                diseaseStageRepository.findByDiseaseIdOrderByStageName(diseaseId));
    }

    @Override
    @Transactional
    public DiseaseDTO createDisease(DiseaseDTO diseaseDTO) {
        // Check for duplicate
        if (diseaseRepository.existsByName(diseaseDTO.getName())) {
            throw new DuplicateResourceException("Disease already exists with name: " + diseaseDTO.getName());
        }

        Disease disease = diseaseMapper.toEntity(diseaseDTO);
        Disease savedDisease = diseaseRepository.save(disease);
        return diseaseMapper.toDTO(savedDisease);
    }

    @Override
    @Transactional
    public DiseaseDTO updateDisease(Long id, DiseaseDTO diseaseDTO) {
        Disease existingDisease = diseaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disease not found with id: " + id));

        // Check for duplicate name (excluding current disease)
        if (!existingDisease.getName().equals(diseaseDTO.getName()) &&
                diseaseRepository.existsByName(diseaseDTO.getName())) {
            throw new DuplicateResourceException("Disease already exists with name: " + diseaseDTO.getName());
        }

        existingDisease.setName(diseaseDTO.getName());
        existingDisease.setDescription(diseaseDTO.getDescription());
        existingDisease.setHasStages(diseaseDTO.getHasStages());

        Disease updatedDisease = diseaseRepository.save(existingDisease);
        return diseaseMapper.toDTO(updatedDisease);
    }

    @Override
    @Transactional
    public void deleteDisease(Long id) {
        if (!diseaseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Disease not found with id: " + id);
        }
        diseaseRepository.deleteById(id);
    }

    @Override
    public List<DiseaseDTO> getDiseasesWithStages() {
        return diseaseMapper.toDTOList(diseaseRepository.findByHasStages(true));
    }
}
