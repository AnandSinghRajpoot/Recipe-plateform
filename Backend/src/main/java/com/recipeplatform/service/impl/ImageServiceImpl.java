package com.recipeplatform.service.impl;

import com.recipeplatform.exception.FileValidationException;
import com.recipeplatform.service.ImageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageServiceImpl implements ImageService {
    private static final Set<String> allowedType = Set.of("image/jpg", "image/jpeg", "image/png");

    private final Path root;

    public ImageServiceImpl(@Value("${app.file-upload.dir}") Path uploadPath) {
        this.root = uploadPath.toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.root);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    @Override
    public String saveImage(MultipartFile file) {
        validateImage(file);
        String fileName = sanitizeImageName(file);
        Path targetPath = root.resolve(fileName);
        try (InputStream is = file.getInputStream()) {
            Files.copy(is, targetPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
        return fileName;
    }

    @Override
    public void deleteImage(Long recipeId) {

    }

    private void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new FileValidationException("file is not valid or empty.");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new FileValidationException("Image size must be less than 2MB.");
        }

        System.out.println("Filename: " + file.getOriginalFilename());
        System.out.println("Content-Type: {}" + file.getContentType());

        String contentType = file.getContentType();
        if (contentType == null || !allowedType.contains(contentType.toLowerCase())) {
            throw new FileValidationException("file type is not supported");
        }

    }

    private String sanitizeImageName(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (!StringUtils.hasText(fileName)) {
            throw new RuntimeException("file name is not available");
        }

        if (fileName.lastIndexOf(".") == -1) {
            throw new RuntimeException("no file extension found.");
        }

        String extension = fileName.substring(fileName.lastIndexOf("."));

        return UUID.randomUUID() + extension;
    }
}
