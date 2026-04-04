package com.beatrice.backendjava.user.mapper;


import com.beatrice.backendjava.user.dto.UserResponse;
import com.beatrice.backendjava.user.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = UserRoleMapper.class)
public interface UserMapper {
    UserResponse toDto(User user);

}

