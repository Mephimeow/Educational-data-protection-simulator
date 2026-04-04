package com.beatrice.backendjava.config;

import com.beatrice.backendjava.user.model.Role;
import com.beatrice.backendjava.user.model.User;
import com.beatrice.backendjava.user.model.UserRole;
import com.beatrice.backendjava.user.repository.RoleRepository;
import com.beatrice.backendjava.user.repository.UserRepository;
import com.beatrice.backendjava.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<String> roleNames = Arrays.asList("USER", "ADMIN");
        
        Role adminRole = null;
        for (String roleName : roleNames) {
            Role role = roleRepository.findByRoleName(roleName).orElseGet(() -> {
                Role newRole = new Role();
                newRole.setRoleName(roleName);
                return roleRepository.save(newRole);
            });
            if (roleName.equals("ADMIN")) {
                adminRole = role;
            }
        }

        if (adminRole != null && userRepository.findUserByEmail("admin@cybersim.ru").isEmpty()) {
            User admin = new User();
            admin.setName("Администратор");
            admin.setEmail("admin@cybersim.ru");
            admin.setPhone("+79001234567");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin = userRepository.save(admin);

            UserRole adminUserRole = new UserRole();
            adminUserRole.setUser(admin);
            adminUserRole.setRole(adminRole);
            userRoleRepository.save(adminUserRole);
        }
    }
}
