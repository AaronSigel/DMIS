package com.dmis.backend.auth.application;

import com.dmis.backend.auth.application.dto.AuthResult;
import com.dmis.backend.auth.application.port.TokenPort;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.users.application.port.UserAccessPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {
    private final UserAccessPort userAccessPort;
    private final TokenPort tokenPort;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserAccessPort userAccessPort, TokenPort tokenPort, PasswordEncoder passwordEncoder) {
        this.userAccessPort = userAccessPort;
        this.tokenPort = tokenPort;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResult login(String email, String password) {
        UserAccessPort.UserWithPassword user = userAccessPort.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(password, user.passwordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }
        return new AuthResult(tokenPort.issue(user.user()), user.user());
    }

    public UserView me(String userId) {
        return userAccessPort.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid user"));
    }
}
