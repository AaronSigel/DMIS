package com.dmis.backend.auth.api;

import com.dmis.backend.auth.application.AuthService;
import com.dmis.backend.auth.application.dto.AuthResult;
import com.dmis.backend.platform.security.CurrentUserProvider;
import com.dmis.backend.shared.model.UserView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final CurrentUserProvider currentUserProvider;

    public AuthController(AuthService authService, CurrentUserProvider currentUserProvider) {
        this.authService = authService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping("/login")
    public AuthResult login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @PostMapping("/refresh")
    public AuthResult refresh(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @GetMapping("/me")
    public UserView me() {
        return currentUserProvider.currentUser();
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {
    }
}
