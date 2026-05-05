package com.dmis.backend.users.api;

import com.dmis.backend.platform.security.CurrentUserProvider;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import com.dmis.backend.users.application.dto.UserSummaryView;
import com.dmis.backend.users.application.port.UserAccessPort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UsersController {
    private final CurrentUserProvider currentUserProvider;
    private final UserAccessPort userAccessPort;
    private final AclService aclService;

    public UsersController(
            CurrentUserProvider currentUserProvider,
            UserAccessPort userAccessPort,
            AclService aclService
    ) {
        this.currentUserProvider = currentUserProvider;
        this.userAccessPort = userAccessPort;
        this.aclService = aclService;
    }

    @GetMapping("/me")
    public UserView me() {
        return currentUserProvider.currentUser();
    }

    @GetMapping
    public List<UserSummaryView> list() {
        aclService.requireAdmin(currentUserProvider.currentUser());
        return userAccessPort.findAllSummaries();
    }
}
