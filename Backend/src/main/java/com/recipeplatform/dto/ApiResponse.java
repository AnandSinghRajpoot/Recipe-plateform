package com.recipeplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T>{
    private String message;
    private T data;
    private int status;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(message, data, 200);
    }
}