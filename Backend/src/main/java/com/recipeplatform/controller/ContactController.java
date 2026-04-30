package com.recipeplatform.controller;

import com.recipeplatform.dto.ContactRequest;
import com.recipeplatform.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
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
    public String sendContactMessage(@RequestBody ContactRequest request) {
        emailService.sendContactMessageEmail(request);
        return "Message sent successfully";
    }
}
