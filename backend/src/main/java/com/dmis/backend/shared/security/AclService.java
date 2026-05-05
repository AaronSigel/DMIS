package com.dmis.backend.shared.security;

import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
public class AclService {
    public boolean isAdmin(UserView user) {
        return user.roles().contains(RoleName.ADMIN);
    }

    public void requireDocumentRead(UserView actor, String ownerId) {
        if (!isAdmin(actor) && !ownerId.equals(actor.id())) {
            throw new ResponseStatusException(FORBIDDEN, "No read access");
        }
    }

    public void requireDocumentWrite(UserView actor, String ownerId) {
        if (!isAdmin(actor) && !ownerId.equals(actor.id())) {
            throw new ResponseStatusException(FORBIDDEN, "No write access");
        }
    }

    public void requireAuditRead(UserView actor) {
        if (!isAdmin(actor)) {
            throw new ResponseStatusException(FORBIDDEN, "Only admin can read full audit");
        }
    }

    public void requireAdmin(UserView actor) {
        if (!isAdmin(actor)) {
            throw new ResponseStatusException(FORBIDDEN, "Admin only");
        }
    }
}
