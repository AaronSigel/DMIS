package com.dmis.backend.users.application;

import com.dmis.backend.users.application.dto.UserSummaryView;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class UserFioMatcherTest {

    private static final UserSummaryView PETROVA =
            new UserSummaryView("u-analyst", "petrova-a-s@example.com", "analyst", "Петрова Анна Сергеевна");
    private static final UserSummaryView KUZNETSOV =
            new UserSummaryView("u-reviewer", "kuznetsov-i-p@example.com", "reviewer", "Кузнецов Игорь Павлович");
    private static final UserSummaryView VOLKOVA =
            new UserSummaryView("u-manager", "volkova-e@example.com", "manager", "Волкова Елена");

    private final List<UserSummaryView> catalog = List.of(PETROVA, KUZNETSOV, VOLKOVA);

    @Test
    void parseSplitsThreeWordFio() {
        UserFioMatcher.Fio fio = UserFioMatcher.parse("Петрова Анна Сергеевна");
        assertThat(fio.surname()).isEqualTo("Петрова");
        assertThat(fio.givenName()).isEqualTo("Анна");
        assertThat(fio.patronymic()).isEqualTo("Сергеевна");
    }

    @Test
    void parseSplitsTwoWordFioWithoutPatronymic() {
        UserFioMatcher.Fio fio = UserFioMatcher.parse("Волкова Елена");
        assertThat(fio.surname()).isEqualTo("Волкова");
        assertThat(fio.givenName()).isEqualTo("Елена");
        assertThat(fio.hasPatronymic()).isFalse();
    }

    @Test
    void buildEmailLocalPartUsesSurnameAndInitials() {
        assertThat(UserFioMatcher.buildEmailLocalPart("Петрова Анна Сергеевна")).isEqualTo("petrova-a-s");
        assertThat(UserFioMatcher.buildEmailLocalPart("Соколов Дмитрий Алексеевич")).isEqualTo("sokolov-d-a");
        assertThat(UserFioMatcher.buildEmailLocalPart("Волкова Елена")).isEqualTo("volkova-e");
    }

    @Test
    void displayShortNameRendersInitials() {
        assertThat(UserFioMatcher.displayShortName("Петрова Анна Сергеевна")).isEqualTo("Петрова А.С.");
        assertThat(UserFioMatcher.displayShortName("Волкова Елена")).isEqualTo("Волкова Е.");
    }

    @Test
    void matchStrictResolvesUniqueSurname() {
        assertThat(UserFioMatcher.matchStrict("Петрова", catalog)).containsExactly(PETROVA);
    }

    @Test
    void matchStrictResolvesInitialsForms() {
        assertThat(UserFioMatcher.matchStrict("Петрова А.С.", catalog)).containsExactly(PETROVA);
        assertThat(UserFioMatcher.matchStrict("А.С. Петрова", catalog)).containsExactly(PETROVA);
        assertThat(UserFioMatcher.matchStrict("Петрова Анна Сергеевна", catalog)).containsExactly(PETROVA);
        assertThat(UserFioMatcher.matchStrict("petrova-a-s", catalog)).containsExactly(PETROVA);
    }

    @Test
    void matchStrictReturnsAllForAmbiguousSurname() {
        UserSummaryView petrovaAlena =
                new UserSummaryView("u-x", "petrova-al-s@example.com", null, "Петрова Алёна Сергеевна");
        List<UserSummaryView> users = List.of(PETROVA, petrovaAlena);
        assertThat(UserFioMatcher.matchStrict("Петрова", users)).containsExactlyInAnyOrder(PETROVA, petrovaAlena);
    }

    @Test
    void matchStrictReturnsEmptyForUnknown() {
        assertThat(UserFioMatcher.matchStrict("Иванов", catalog)).isEmpty();
    }

    @Test
    void matchSearchFindsBySurnamePrefixAndNickname() {
        assertThat(UserFioMatcher.matchSearch("Кузн", catalog, 10)).containsExactly(KUZNETSOV);
        assertThat(UserFioMatcher.matchSearch("analyst", catalog, 10)).containsExactly(PETROVA);
        assertThat(UserFioMatcher.matchSearch("petrova-a", catalog, 10)).containsExactly(PETROVA);
    }

    @Test
    void allocateUniqueLocalPartReturnsBaseWhenFree() {
        assertThat(DemoEmailGenerator.allocateUniqueLocalPart("Петрова Анна Сергеевна", Set.of()))
                .isEqualTo("petrova-a-s");
    }

    @Test
    void allocateUniqueLocalPartExpandsGivenNameOnCollision() {
        String localPart = DemoEmailGenerator.allocateUniqueLocalPart(
                "Петрова Алёна Сергеевна", Set.of("petrova-a-s"));
        assertThat(localPart).isEqualTo("petrova-al-s");
        assertThat(localPart).isNotEqualTo("petrova-a-s");
    }

    @Test
    void allocateUniqueLocalPartKeepsHomonymsDistinct() {
        String first = DemoEmailGenerator.allocateUniqueLocalPart("Петрова Анна Сергеевна", Set.of());
        String second = DemoEmailGenerator.allocateUniqueLocalPart("Петрова Анна Сергеевна", Set.of(first));
        assertThat(second).isNotEqualTo(first);
    }
}
