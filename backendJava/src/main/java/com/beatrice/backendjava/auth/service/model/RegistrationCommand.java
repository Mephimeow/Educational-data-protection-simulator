package com.beatrice.backendjava.auth.service.model;

public record RegistrationCommand(String name, String email, String phone, String password) {
}
