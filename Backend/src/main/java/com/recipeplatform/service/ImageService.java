package com.recipeplatform.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ImageService {
    public String saveImage(MultipartFile file);

    public void deleteImage(Long recipeId);
}
