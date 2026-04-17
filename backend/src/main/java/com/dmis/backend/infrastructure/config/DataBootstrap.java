package com.dmis.backend.platform.config;

import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.users.infra.persistence.entity.RoleEntity;
import com.dmis.backend.users.infra.persistence.entity.UserEntity;
import com.dmis.backend.users.infra.persistence.repository.RoleJpaRepository;
import com.dmis.backend.users.infra.persistence.repository.UserJpaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataBootstrap implements CommandLineRunner {
    private final RoleJpaRepository roleRepository;
    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataBootstrap(RoleJpaRepository roleRepository, UserJpaRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        RoleEntity adminRole = roleRepository.findById(RoleName.ADMIN.name())
                .orElseGet(() -> roleRepository.save(new RoleEntity(RoleName.ADMIN.name())));
        RoleEntity userRole = roleRepository.findById(RoleName.USER.name())
                .orElseGet(() -> roleRepository.save(new RoleEntity(RoleName.USER.name())));

        userRepository.findByEmailIgnoreCase("admin@dmis.local").orElseGet(() -> userRepository.save(
                new UserEntity("u-admin", "admin@dmis.local", "System Admin", passwordEncoder.encode("demo"), Set.of(adminRole))
        ));
        userRepository.findByEmailIgnoreCase("analyst@dmis.local").orElseGet(() -> userRepository.save(
                new UserEntity("u-analyst", "analyst@dmis.local", "Data Analyst", passwordEncoder.encode("demo"), Set.of(userRole))
        ));
    }
}
