package com.beatrice.backendjava.user.mapper;

import com.beatrice.backendjava.user.dto.UserRoleResponse;
import com.beatrice.backendjava.user.model.UserRole;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserRoleMapper {
    @Mapping(source = "role.id", target = "roleId")
    @Mapping(source = "role.roleName", target = "roleName")
    @Mapping(source = "assignedAt", target = "assignedAt")
    UserRoleResponse toDto(UserRole userRole);
}
