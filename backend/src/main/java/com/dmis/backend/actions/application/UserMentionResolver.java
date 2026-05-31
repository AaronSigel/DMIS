package com.dmis.backend.actions.application;

import com.dmis.backend.users.application.dto.UserSummaryView;
import com.dmis.backend.users.application.port.UserAccessPort;
import com.dmis.backend.users.application.UserFioMatcher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Сопоставление {@code @}/{@code #} упоминания пользователя из каталога с email.
 * Строку без mention-префикса возвращает без изменений (после trim).
 */
@Service
public class UserMentionResolver {

    private final UserAccessPort userAccessPort;

    public UserMentionResolver(UserAccessPort userAccessPort) {
        this.userAccessPort = userAccessPort;
    }

    public String resolve(String value) {
        String trimmed = value.trim();
        boolean hasMentionPrefix = trimmed.startsWith("@") || trimmed.startsWith("#");
        if (!hasMentionPrefix || trimmed.length() == 1) {
            return trimmed;
        }

        String mention = trimmed.substring(1).trim();
        if (mention.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User mention must not be blank");
        }

        List<UserSummaryView> users = userAccessPort.findAllSummaries();
        List<UserSummaryView> nicknameMatches = users.stream()
                .filter(user -> user.nickname() != null && user.nickname().equalsIgnoreCase(mention))
                .toList();
        if (nicknameMatches.size() == 1) {
            return nicknameMatches.get(0).email();
        }
        if (nicknameMatches.size() > 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ambiguous user mention: " + trimmed);
        }

        List<UserSummaryView> emailMatches = users.stream()
                .filter(user -> localPart(user.email()).equalsIgnoreCase(mention) || user.email().equalsIgnoreCase(mention))
                .toList();
        if (emailMatches.size() == 1) {
            return emailMatches.get(0).email();
        }
        if (emailMatches.size() > 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ambiguous user mention: " + trimmed);
        }

        List<UserSummaryView> nameMatches = UserFioMatcher.matchStrict(mention, users);
        if (nameMatches.size() == 1) {
            return nameMatches.get(0).email();
        }
        if (nameMatches.size() > 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ambiguous user mention: " + trimmed);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown user mention: " + trimmed);
    }

    private static String localPart(String email) {
        int at = email.indexOf('@');
        return at < 0 ? email : email.substring(0, at);
    }

}
