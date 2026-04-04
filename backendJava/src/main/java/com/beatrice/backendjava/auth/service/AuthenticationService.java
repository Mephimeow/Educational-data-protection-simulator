package com.beatrice.backendjava.auth.service;

import com.beatrice.backendjava.auth.model.RefreshToken;
import com.beatrice.backendjava.auth.repository.RefreshTokenRepository;
import com.beatrice.backendjava.auth.security.JwtService;
import com.beatrice.backendjava.auth.security.SecurityUser;
import com.beatrice.backendjava.auth.service.model.LoginCommand;
import com.beatrice.backendjava.auth.service.model.TokenPair;
import com.beatrice.backendjava.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;


    public TokenPair login(LoginCommand cmd) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(cmd.email(), cmd.rawPassword()));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(cmd.email());
        User user = ((SecurityUser) userDetails).user();

        String accessToken = jwtService.generateAccessToken(user);

        RefreshToken refreshToken = refreshTokenService.create(user);

        return new TokenPair(accessToken, refreshToken.getToken());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.revokeByToken(refreshToken);
    }


    @Transactional
    public TokenPair refresh(String refreshToken) {
        RefreshToken stored = refreshTokenService.validate(refreshToken);
        String accessToken = jwtService.generateAccessToken(stored.getUser());
        RefreshToken newToken = refreshTokenService.create(stored.getUser());
        return new TokenPair(accessToken, newToken.getToken());
    }
}
