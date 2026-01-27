package com.recipeplatform.mapper;

import com.recipeplatform.domain.User;
import com.recipeplatform.dto.auth.RegisterRequest;
import com.recipeplatform.dto.auth.RegisterResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    User toEntity(RegisterRequest registerRequest);

    RegisterResponse toDto(User user);
}
