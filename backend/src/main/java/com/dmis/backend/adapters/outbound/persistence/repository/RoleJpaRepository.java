package com.dmis.backend.users.infra.persistence.repository;

import com.dmis.backend.users.infra.persistence.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleJpaRepository extends JpaRepository<RoleEntity, String> {
}
