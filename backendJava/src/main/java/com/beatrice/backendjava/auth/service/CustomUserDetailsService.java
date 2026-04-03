package com.beatrice.backendjava.auth.service;

import com.beatrice.backendjava.auth.security.SecurityUser;
import com.beatrice.backendjava.user.model.User;
import com.beatrice.backendjava.user.repository.UserRepository;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {


    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public @NonNull UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        User user = userRepository.findUserByEmailWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        return new SecurityUser(user);
    }
}
