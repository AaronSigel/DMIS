package com.dmis.backend.users.api;

import com.dmis.backend.platform.security.CurrentUserProvider;
import com.dmis.backend.shared.model.UserView;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UsersController {
    private final CurrentUserProvider currentUserProvider;

    public UsersController(CurrentUserProvider currentUserProvider) {
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/me")
    public UserView me() {
        return currentUserProvider.currentUser();
    }
}
