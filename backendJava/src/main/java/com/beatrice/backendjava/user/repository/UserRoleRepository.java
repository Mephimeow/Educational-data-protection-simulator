package com.beatrice.backendjava.user.repository;

import com.beatrice.backendjava.user.model.UserRole;
import com.beatrice.backendjava.user.model.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
}
