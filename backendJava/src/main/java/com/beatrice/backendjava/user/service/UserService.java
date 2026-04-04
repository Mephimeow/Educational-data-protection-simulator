package com.beatrice.backendjava.user.service;

import com.beatrice.backendjava.auth.security.SecurityUser;
import com.beatrice.backendjava.user.dto.UserResponse;
import com.beatrice.backendjava.user.mapper.UserMapper;
import com.beatrice.backendjava.user.model.User;
import com.beatrice.backendjava.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;

    public @Nullable UserResponse whoami(SecurityUser user) {
        if (user != null) {
            return userMapper.toDto(user.user());
        }

        return null;
    }

    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found")); // TODO replace with custom exception
    }
}
