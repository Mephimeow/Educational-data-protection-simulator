package com.beatrice.backendjava.auth.service;

import com.beatrice.backendjava.auth.exception.InvalidTokenException;
import com.beatrice.backendjava.auth.exception.RevokedTokenException;
import com.beatrice.backendjava.auth.exception.TokenNotFoundException;
import com.beatrice.backendjava.auth.model.RefreshToken;
import com.beatrice.backendjava.auth.repository.RefreshTokenRepository;
import com.beatrice.backendjava.config.JwtProperties;
import com.beatrice.backendjava.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {


    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;
    private final TokenRevocationService tokenRevocationService;

    /**
     * @return UUID representing refresh token
     */
//    Why UUID instead of JWT? UUID refresh token is stateful.
//    I can't revoke JWT cause it's stateless but I can revoke UUID (until I store it in DB)
    public RefreshToken create(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(jwtProperties.getRefreshTokenTtl(), ChronoUnit.DAYS);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(token);
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(expiryDate);
        refreshToken.setRevoked(false);
        return refreshTokenRepository.save(refreshToken);

    }


    @Transactional
    public RefreshToken validate(String tokenValue) {

        int updated = refreshTokenRepository.consumeToken(tokenValue, Instant.now());

        if (updated == 0) {
            RefreshToken existing = refreshTokenRepository.findRefreshTokenByToken(tokenValue)
                    .orElseThrow(() -> new TokenNotFoundException("Refresh token not found"));

            if (existing.getRevoked()) {
                tokenRevocationService.revokeAllByUser(existing.getUser());
                throw new RevokedTokenException("Token reuse detected. Every other token will be revoked for security reasons");
            }

            if (existing.getExpiryDate().isBefore(Instant.now())) {
                throw new InvalidTokenException("Token expired");
            }

            throw new InvalidTokenException("Invalid refresh token");
        }

        return refreshTokenRepository.findRefreshTokenByToken(tokenValue).get();
    }

}
