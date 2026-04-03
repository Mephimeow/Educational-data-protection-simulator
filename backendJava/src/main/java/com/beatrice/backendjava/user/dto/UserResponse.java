package com.beatrice.backendjava.user.dto;

import java.util.Set;

public record UserResponse(
        Integer id,
        String email,
        String phone,
        Set<UserRoleResponse> userRoles
) {
}
