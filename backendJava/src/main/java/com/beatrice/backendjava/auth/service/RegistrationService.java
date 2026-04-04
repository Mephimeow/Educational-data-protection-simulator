package com.beatrice.backendjava.auth.service;

import com.beatrice.backendjava.auth.exception.PhoneAlreadyExistsException;
import com.beatrice.backendjava.auth.exception.UserAlreadyExistsException;
import com.beatrice.backendjava.auth.service.model.RegistrationCommand;
import com.beatrice.backendjava.auth.util.PhoneNormalizer;
import com.beatrice.backendjava.user.model.Role;
import com.beatrice.backendjava.user.model.User;
import com.beatrice.backendjava.user.model.UserRole;
import com.beatrice.backendjava.user.repository.RoleRepository;
import com.beatrice.backendjava.user.repository.UserRepository;
import com.beatrice.backendjava.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;


    @Transactional
    public void registerUser(RegistrationCommand cmd) {
        userRepository.findUserByEmail(cmd.email())
                .ifPresent(_ -> {
                    throw new UserAlreadyExistsException("User with stated email already exists: " + cmd.email());
                });

        String normalizedPhone = PhoneNormalizer.normalize(cmd.phone());
        if (userRepository.existsUserByPhone(normalizedPhone)) {
            throw new PhoneAlreadyExistsException("User with stated phone already exists: " + cmd.phone());
        }
        User user = new User();
        user.setEmail(cmd.email());
        user.setPhone(normalizedPhone);
        user.setPasswordHash(passwordEncoder.encode(cmd.password()));
        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) { // ловим исключение на случай гонки
            throw new UserAlreadyExistsException("User with stated email/phone already exists: " + cmd.email());
        }
        Role role = roleRepository.findByRoleName("USER").orElseThrow(
                () -> new IllegalStateException("Role USER not found")
        );

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);

        userRoleRepository.save(userRole);
    }
}
