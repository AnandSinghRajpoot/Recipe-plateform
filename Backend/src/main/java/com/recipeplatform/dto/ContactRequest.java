package com.recipeplatform.dto;

import lombok.Data;

@Data
public class ContactRequest {
    private String name;
    private String email;
    private String address;
    private String message;
}
