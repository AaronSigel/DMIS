package com.dmis.backend.actions.application;

import com.dmis.backend.users.application.dto.UserSummaryView;
import com.dmis.backend.users.application.port.UserAccessPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserMentionResolverTest {

    private UserAccessPort userAccessPort;
    private UserMentionResolver resolver;

    @BeforeEach
    void setUp() {
        userAccessPort = mock(UserAccessPort.class);
        resolver = new UserMentionResolver(userAccessPort);
        when(userAccessPort.findAllSummaries()).thenReturn(List.of(
                new UserSummaryView("u-admin", "sokolov-d-a@example.com", "admin", "Соколов Дмитрий Алексеевич"),
                new UserSummaryView("u-analyst", "petrova-a-s@example.com", "analyst", "Петрова Анна Сергеевна"),
                new UserSummaryView("u-reviewer", "kuznetsov-i-p@example.com", "reviewer", "Кузнецов Игорь Павлович")
        ));
    }

    @Test
    void resolvesByNickname() {
        assertThat(resolver.resolve("@analyst")).isEqualTo("petrova-a-s@example.com");
    }

    @Test
    void resolvesByEmailLocalPart() {
        assertThat(resolver.resolve("@petrova-a-s")).isEqualTo("petrova-a-s@example.com");
    }

    @Test
    void resolvesBySurname() {
        assertThat(resolver.resolve("@Петрова")).isEqualTo("petrova-a-s@example.com");
        assertThat(resolver.resolve("@Кузнецов")).isEqualTo("kuznetsov-i-p@example.com");
    }

    @Test
    void resolvesByInitialsForm() {
        assertThat(resolver.resolve("@Петрова А.С.")).isEqualTo("petrova-a-s@example.com");
    }

    @Test
    void resolvesHashMentionByInitialsForm() {
        assertThat(resolver.resolve("#Петрова А.С.")).isEqualTo("petrova-a-s@example.com");
    }

    @Test
    void returnsPlainValueWhenNoMentionPrefix() {
        assertThat(resolver.resolve("external@example.com")).isEqualTo("external@example.com");
    }

    @Test
    void rejectsUnknownMention() {
        assertThatThrownBy(() -> resolver.resolve("@Иванов"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Unknown user mention");
    }

    @Test
    void rejectsAmbiguousSurname() {
        when(userAccessPort.findAllSummaries()).thenReturn(List.of(
                new UserSummaryView("u-1", "petrova-a-s@example.com", null, "Петрова Анна Сергеевна"),
                new UserSummaryView("u-2", "petrova-e-v@example.com", null, "Петрова Елена Викторовна")
        ));
        assertThatThrownBy(() -> resolver.resolve("@Петрова"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Ambiguous user mention");
    }
}
