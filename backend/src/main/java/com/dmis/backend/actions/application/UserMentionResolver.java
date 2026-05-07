package com.dmis.backend.actions.application;

import com.dmis.backend.users.application.dto.UserSummaryView;
import com.dmis.backend.users.application.port.UserAccessPort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

/**
 * Сопоставление {@code @упоминания} пользователя из каталога с email.
 * Строку без префикса {@code @} возвращает без изменений (после trim).
 */
@Service
public class UserMentionResolver {

    private final UserAccessPort userAccessPort;

    public UserMentionResolver(UserAccessPort userAccessPort) {
        this.userAccessPort = userAccessPort;
    }

    public String resolve(String value) {
        String trimmed = value.trim();
        if (!trimmed.startsWith("@") || trimmed.length() == 1) {
            return trimmed;
        }

        String mention = trimmed.substring(1).trim();
        if (mention.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User mention must not be blank");
        }

        List<UserSummaryView> users = userAccessPort.findAllSummaries();
        List<UserSummaryView> emailMatches = users.stream()
                .filter(user -> localPart(user.email()).equalsIgnoreCase(mention) || user.email().equalsIgnoreCase(mention))
                .toList();
        if (emailMatches.size() == 1) {
            return emailMatches.get(0).email();
        }
        if (emailMatches.size() > 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ambiguous user mention: " + trimmed);
        }

        String normalizedMention = normalizeMention(mention);
        List<UserSummaryView> nameMatches = users.stream()
                .filter(user -> normalizeMention(user.fullName()).equals(normalizedMention))
                .toList();
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

    private static String normalizeMention(String value) {
        return value == null
                ? ""
                : value.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[\\s._-]+", " ");
    }
}
