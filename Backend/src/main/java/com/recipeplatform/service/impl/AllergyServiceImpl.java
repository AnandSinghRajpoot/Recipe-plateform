package com.recipeplatform.service.impl;

import com.recipeplatform.domain.Allergy;
import com.recipeplatform.dto.AllergyDTO;
import com.recipeplatform.exception.DuplicateResourceException;
import com.recipeplatform.exception.ResourceNotFoundException;
import com.recipeplatform.mapper.AllergyMapper;
import com.recipeplatform.repository.AllergyRepository;
import com.recipeplatform.service.AllergyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AllergyServiceImpl implements AllergyService {

    private final AllergyRepository allergyRepository;
    private final AllergyMapper allergyMapper;

    @Override
    public List<AllergyDTO> getAllAllergies() {
        return allergyMapper.toDTOList(allergyRepository.findAll());
    }

    @Override
    public AllergyDTO getAllergyById(Long id) {
        Allergy allergy = allergyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + id));
        return allergyMapper.toDTO(allergy);
    }

    @Override
    @Transactional
    public AllergyDTO createAllergy(AllergyDTO allergyDTO) {
        // Check for duplicate
        if (allergyRepository.existsByName(allergyDTO.getName())) {
            throw new DuplicateResourceException("Allergy already exists with name: " + allergyDTO.getName());
        }

        Allergy allergy = allergyMapper.toEntity(allergyDTO);
        Allergy savedAllergy = allergyRepository.save(allergy);
        return allergyMapper.toDTO(savedAllergy);
    }

    @Override
    @Transactional
    public AllergyDTO updateAllergy(Long id, AllergyDTO allergyDTO) {
        Allergy existingAllergy = allergyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + id));

        // Check for duplicate name (excluding current allergy)
        if (!existingAllergy.getName().equals(allergyDTO.getName()) &&
                allergyRepository.existsByName(allergyDTO.getName())) {
            throw new DuplicateResourceException("Allergy already exists with name: " + allergyDTO.getName());
        }

        existingAllergy.setName(allergyDTO.getName());
        existingAllergy.setDescription(allergyDTO.getDescription());

        Allergy updatedAllergy = allergyRepository.save(existingAllergy);
        return allergyMapper.toDTO(updatedAllergy);
    }

    @Override
    @Transactional
    public void deleteAllergy(Long id) {
        if (!allergyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Allergy not found with id: " + id);
        }
        allergyRepository.deleteById(id);
    }
}
