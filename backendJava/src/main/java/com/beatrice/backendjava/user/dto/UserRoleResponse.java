package com.beatrice.backendjava.user.dto;

import java.time.Instant;

public record UserRoleResponse(
        String roleId,
        String roleName,
        Instant assignedAt
) {
}
