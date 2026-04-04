package com.beatrice.backendjava.user.service;

import com.beatrice.backendjava.auth.security.SecurityUser;
import com.beatrice.backendjava.user.dto.UserResponse;
import com.beatrice.backendjava.user.mapper.UserMapper;
import com.beatrice.backendjava.user.model.Role;
import com.beatrice.backendjava.user.model.User;
import com.beatrice.backendjava.user.model.UserRole;
import com.beatrice.backendjava.user.repository.RoleRepository;
import com.beatrice.backendjava.user.repository.UserRepository;
import com.beatrice.backendjava.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    public @Nullable UserResponse whoami(SecurityUser user) {
        if (user != null) {
            return userMapper.toDto(user.user());
        }

        return null;
    }

    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Integer userId) {
        userRepository.deleteById(userId);
    }

    @Transactional
    public void changeUserRole(Integer userId, String roleName, boolean granted) {
        User user = getUserById(userId);
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));

        boolean hasRole = user.getUserRoles().stream()
                .anyMatch(ur -> ur.getRole().getRoleName().equals(roleName));

        if (granted && !hasRole) {
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(role);
            userRoleRepository.save(userRole);
        } else if (!granted && hasRole) {
            user.getUserRoles().stream()
                    .filter(ur -> ur.getRole().getRoleName().equals(roleName))
                    .findFirst()
                    .ifPresent(userRoleRepository::delete);
        }
    }
}
