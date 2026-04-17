package com.dmis.backend.platform.security;

import com.dmis.backend.auth.application.AuthService;
import com.dmis.backend.shared.model.UserView;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {
    private final AuthService authService;

    public CurrentUserProvider(AuthService authService) {
        this.authService = authService;
    }

    public UserView currentUser() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return authService.me(principal.userId());
    }
}
