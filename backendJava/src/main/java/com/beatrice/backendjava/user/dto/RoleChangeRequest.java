package com.beatrice.backendjava.user.dto;

public record RoleChangeRequest(
    String roleName,
    boolean granted
) {}
