package com.dmis.backend.platform.config;

import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.users.infra.persistence.entity.RoleEntity;
import com.dmis.backend.users.infra.persistence.entity.UserEntity;
import com.dmis.backend.users.infra.persistence.repository.RoleJpaRepository;
import com.dmis.backend.users.infra.persistence.repository.UserJpaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@Order(1)
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
        ensureDemoUser("u-admin", "sokolov-d-a", "admin", "Соколов Дмитрий Алексеевич", adminRole);
        ensureDemoUser("u-analyst", "petrova-a-s", "analyst", "Петрова Анна Сергеевна", userRole);
        ensureDemoUser("u-reviewer", "kuznetsov-i-p", "reviewer", "Кузнецов Игорь Павлович", userRole);
        ensureDemoUser("u-manager", "volkova-e-v", "manager", "Волкова Елена Викторовна", userRole);
    }

    private void ensureDemoUser(String id, String localPart, String nickname, String fullName, RoleEntity primaryRole) {
        String email = localPart + "@" + demoEmailDomain;
        userRepository.findById(id).ifPresentOrElse(
                existing -> {
                    if (!email.equalsIgnoreCase(existing.getEmail())
                            || !fullName.equals(existing.getFullName())
                            || existing.getNickname() == null
                            || existing.getNickname().isBlank()) {
                        userRepository.save(new UserEntity(
                                existing.getId(),
                                email,
                                nickname,
                                fullName,
                                existing.getPasswordHash(),
                                existing.getRoles()));
                    }
                },
                () -> userRepository.findByEmailIgnoreCase(email).orElseGet(() ->
                        userRepository.save(new UserEntity(
                                id,
                                email,
                                nickname,
                                fullName,
                                passwordEncoder.encode("demo"),
                                Set.of(primaryRole)))));
    }
}
