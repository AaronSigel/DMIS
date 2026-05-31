package com.dmis.backend.users.application;

import java.util.Set;

/**
 * Генерация email demo-пользователей из ФИО в формате {@code petrova-a-s@domain}
 * с детерминированным разрешением коллизий.
 */
public final class DemoEmailGenerator {

    private DemoEmailGenerator() {
    }

    /**
     * Подбирает уникальный localPart для ФИО, не пересекающийся с {@code takenLocalParts}.
     *
     * <p>Алгоритм:
     * <ol>
     *   <li>базовый slug {@code фамилия-и-о} (инициалы имени и отчества);</li>
     *   <li>при коллизии — расширение имени посимвольно
     *       ({@code petrova-an-s}, {@code petrova-ann-s}, …);</li>
     *   <li>если имя исчерпано — числовой суффикс {@code -2}, {@code -3}, …</li>
     * </ol>
     */
    public static String allocateUniqueLocalPart(String fullName, Set<String> takenLocalParts) {
        UserFioMatcher.Fio fio = UserFioMatcher.parse(fullName);
        String surname = UserFioMatcher.transliterate(fio.surname());
        String patronymicPart = fio.hasPatronymic()
                ? "-" + UserFioMatcher.transliterate(fio.patronymic()).substring(0, 1)
                : "";

        if (fio.hasGivenName()) {
            String given = fio.givenName();
            for (int len = 1; len <= given.length(); len++) {
                String givenSlug = UserFioMatcher.transliterate(given.substring(0, len));
                String candidate = surname + "-" + givenSlug + patronymicPart;
                if (!takenLocalParts.contains(candidate)) {
                    return candidate;
                }
            }
        }

        String base = surname + (fio.hasGivenName()
                ? "-" + UserFioMatcher.transliterate(fio.givenName())
                : "") + patronymicPart;
        if (!takenLocalParts.contains(base)) {
            return base;
        }
        int suffix = 2;
        String candidate = base + "-" + suffix;
        while (takenLocalParts.contains(candidate)) {
            suffix++;
            candidate = base + "-" + suffix;
        }
        return candidate;
    }
}
