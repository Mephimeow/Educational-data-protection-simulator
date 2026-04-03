package com.beatrice.backendjava.user.controller;

import com.beatrice.backendjava.auth.security.SecurityUser;
import com.beatrice.backendjava.user.dto.UserResponse;
import com.beatrice.backendjava.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
class UserController {

    private final UserService userService;

    @SuppressWarnings("deprecation")
    @GetMapping("/whoami")
    public ResponseEntity<UserResponse> whoami(@AuthenticationPrincipal SecurityUser user) {
        UserResponse response = userService.whoami(user);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.I_AM_A_TEAPOT).build(); // why not?
        }
        return ResponseEntity.ok(response);
    }
}
