package com.recipeplatform.mapper;

import com.recipeplatform.domain.Category;
import com.recipeplatform.dto.CategoryDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "recipes", ignore = true)
    Category toEntity(CategoryDTO dto);

    CategoryDTO toDTO(Category category);

    List<CategoryDTO> toDTOList(List<Category> categories);
}
