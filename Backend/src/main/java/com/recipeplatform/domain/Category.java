//package com.recipeplatform.domain;
//
//import jakarta.persistence.*;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.Size;
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class Category {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @NotBlank(message = "Category name is required")
//    @Size(min = 2, max = 50, message = "Category name must be between 2 and 50 characters")
//    @Column(nullable = false, unique = true)
//    private String name;
//
//    @Column(columnDefinition = "TEXT")
//    private String description;
//
//    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
//    private List<Recipe> recipes = new ArrayList<>();
//}
