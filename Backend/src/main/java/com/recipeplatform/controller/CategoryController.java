//package com.recipeplatform.controller;
//
//import com.recipeplatform.dto.CategoryDTO;
//import com.recipeplatform.service.CategoryService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/categories")
//@RequiredArgsConstructor
//@Slf4j
//@CrossOrigin(origins = "*")
//public class CategoryController {
//
//    private final CategoryService categoryService;
//
//    @PostMapping
//    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
//        log.info("REST request to create category: {}", categoryDTO.getName());
//        CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
//        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<CategoryDTO> updateCategory(
//            @PathVariable Long id,
//            @Valid @RequestBody CategoryDTO categoryDTO) {
//        log.info("REST request to update category with id: {}", id);
//        CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO);
//        return ResponseEntity.ok(updatedCategory);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
//        log.info("REST request to delete category with id: {}", id);
//        categoryService.deleteCategory(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
//        log.info("REST request to get category with id: {}", id);
//        CategoryDTO category = categoryService.getCategoryById(id);
//        return ResponseEntity.ok(category);
//    }
//
//    @GetMapping
//    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
//        log.info("REST request to get all categories");
//        List<CategoryDTO> categories = categoryService.getAllCategories();
//        return ResponseEntity.ok(categories);
//    }
//
//    @GetMapping("/name/{name}")
//    public ResponseEntity<CategoryDTO> getCategoryByName(@PathVariable String name) {
//        log.info("REST request to get category by name: {}", name);
//        CategoryDTO category = categoryService.getCategoryByName(name);
//        return ResponseEntity.ok(category);
//    }
//}
