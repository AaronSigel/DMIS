package com.dmis.backend.platform.config;

import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.users.infra.persistence.entity.RoleEntity;
import com.dmis.backend.users.infra.persistence.entity.UserEntity;
import com.dmis.backend.users.infra.persistence.repository.RoleJpaRepository;
import com.dmis.backend.users.infra.persistence.repository.UserJpaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@Profile({"demo", "test"})
public class DataBootstrap implements CommandLineRunner {
    private final RoleJpaRepository roleRepository;
    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** Домен без «.local»: интеграции SMTP/IMAP отклоняют .local (см. MailCalendarHttpAdapter). */
    @Value("${dmis.demo.email-domain:example.com}")
    private String demoEmailDomain;

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
        RoleEntity viewerRole = roleRepository.findById(RoleName.VIEWER.name())
                .orElseGet(() -> roleRepository.save(new RoleEntity(RoleName.VIEWER.name())));

        ensureDemoUser("u-admin", "admin", "System Admin", adminRole);
        ensureDemoUser("u-analyst", "analyst", "Data Analyst", userRole);
        ensureDemoUser("u-reviewer", "reviewer", "Document Reviewer", userRole);
        ensureDemoUser("u-manager", "manager", "Project Manager", userRole);
        ensureDemoUser("u-viewer", "viewer", "Read-only Viewer", viewerRole);
    }

    private void ensureDemoUser(String id, String localPart, String fullName, RoleEntity primaryRole) {
        String email = localPart + "@" + demoEmailDomain;
        userRepository.findById(id).ifPresentOrElse(
                existing -> {
                    if (!email.equalsIgnoreCase(existing.getEmail())) {
                        userRepository.save(new UserEntity(
                                existing.getId(),
                                email,
                                existing.getFullName(),
                                existing.getPasswordHash(),
                                existing.getRoles()));
                    }
                },
                () -> userRepository.findByEmailIgnoreCase(email).orElseGet(() ->
                        userRepository.save(new UserEntity(
                                id,
                                email,
                                fullName,
                                passwordEncoder.encode("demo"),
                                Set.of(primaryRole)))));
    }
}
