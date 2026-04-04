package com.beatrice.backendjava.auth.service.model;

public record LoginCommand(String email, String rawPassword) {
}
