package com.recipeplatform.controller;

import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.dto.ContactRequest;
import com.recipeplatform.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contact")
public class ContactController {

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<ApiResponse<String>> sendContactMessage(@Valid @RequestBody ContactRequest request) {
        try {
            emailService.sendContactMessageEmail(request);
            return ResponseEntity.ok(new ApiResponse<>("Message sent successfully", "Message sent", 200));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>("Failed to send message: " + e.getMessage(), null, 500));
        }
    }
}
