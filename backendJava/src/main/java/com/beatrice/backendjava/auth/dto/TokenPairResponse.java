package com.beatrice.backendjava.auth.dto;

public record TokenPairResponse(String accessToken, String refreshToken) {
}
