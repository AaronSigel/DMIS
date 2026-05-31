package com.dmis.backend.users.application;

import com.dmis.backend.users.application.dto.UserSummaryView;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;

/**
 * Разбор ФИО, генерация ключей поиска (фамилия, формы инициалов, localPart email)
 * и сопоставление пользователей по упоминанию или поисковому запросу.
 *
 * <p>ФИО хранится в {@code users.full_name} в формате «Фамилия Имя Отчество».
 * Отдельных колонок для инициалов нет — всё вычисляется из этой строки.
 */
public final class UserFioMatcher {

    private UserFioMatcher() {
    }

    /** Разобранное ФИО. Отчество может отсутствовать (ФИО из двух слов). */
    public record Fio(String surname, String givenName, String patronymic) {
        public boolean hasGivenName() {
            return givenName != null && !givenName.isBlank();
        }

        public boolean hasPatronymic() {
            return patronymic != null && !patronymic.isBlank();
        }
    }

    public static Fio parse(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new Fio("", null, null);
        }
        String[] parts = fullName.trim().split("\\s+");
        String surname = parts.length > 0 ? parts[0] : "";
        String given = parts.length > 1 ? parts[1] : null;
        String patronymic = parts.length > 2 ? parts[2] : null;
        return new Fio(surname, given, patronymic);
    }

    /**
     * Базовый localPart email из ФИО: {@code petrova-a-s} (фамилия + инициалы имени и отчества).
     * При отсутствии отчества: {@code volkova-e}. Без коллизий — их разрешает {@link DemoEmailGenerator}.
     */
    public static String buildEmailLocalPart(String fullName) {
        Fio fio = parse(fullName);
        StringBuilder sb = new StringBuilder(transliterate(fio.surname()));
        if (fio.hasGivenName()) {
            sb.append('-').append(transliterate(initial(fio.givenName())));
        }
        if (fio.hasPatronymic()) {
            sb.append('-').append(transliterate(initial(fio.patronymic())));
        }
        return sb.toString();
    }

    /**
     * Strict-сопоставление токена упоминания с каталогом: фамилия, полное ФИО,
     * формы «Фамилия И.О.» / «И.О. Фамилия», localPart email.
     * Возвращает все совпавшие записи (0 / 1 / N решает вызывающий код).
     */
    public static List<UserSummaryView> matchStrict(String mentionToken, List<UserSummaryView> users) {
        String normalized = normalize(mentionToken);
        if (normalized.isBlank()) {
            return List.of();
        }
        List<UserSummaryView> matches = new ArrayList<>();
        for (UserSummaryView user : users) {
            if (strictKeys(user).contains(normalized)) {
                matches.add(user);
            }
        }
        return matches;
    }

    /**
     * Поиск (substring) по ключам ФИО, email и nickname. Используется для autocomplete.
     */
    public static List<UserSummaryView> matchSearch(String query, List<UserSummaryView> users, int limit) {
        String normalized = normalize(query);
        if (normalized.isBlank()) {
            return List.of();
        }
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        List<UserSummaryView> matches = new ArrayList<>();
        for (UserSummaryView user : users) {
            if (matchesSearch(user, normalized)) {
                matches.add(user);
                if (matches.size() >= safeLimit) {
                    break;
                }
            }
        }
        return matches;
    }

    /** Короткое отображаемое имя «Петрова А.С.» для UI и autocomplete. */
    public static String displayShortName(String fullName) {
        Fio fio = parse(fullName);
        if (fio.surname().isBlank()) {
            return fullName == null ? "" : fullName.trim();
        }
        StringBuilder sb = new StringBuilder(fio.surname());
        if (fio.hasGivenName()) {
            sb.append(' ').append(initial(fio.givenName())).append('.');
        }
        if (fio.hasPatronymic()) {
            sb.append(initial(fio.patronymic())).append('.');
        }
        return sb.toString();
    }

    private static boolean matchesSearch(UserSummaryView user, String normalizedQuery) {
        for (String key : searchKeys(user)) {
            if (key.contains(normalizedQuery)) {
                return true;
            }
        }
        return false;
    }

    private static LinkedHashSet<String> strictKeys(UserSummaryView user) {
        LinkedHashSet<String> keys = new LinkedHashSet<>();
        Fio fio = parse(user.fullName());
        if (user.fullName() != null) {
            keys.add(normalize(user.fullName()));
        }
        if (!fio.surname().isBlank()) {
            keys.add(normalize(fio.surname()));
            if (fio.hasGivenName()) {
                String initials = buildInitials(fio);
                keys.add(normalize(fio.surname() + " " + initials));
                keys.add(normalize(initials + " " + fio.surname()));
            }
        }
        if (user.email() != null) {
            keys.add(normalize(localPart(user.email())));
        }
        return keys;
    }

    private static LinkedHashSet<String> searchKeys(UserSummaryView user) {
        LinkedHashSet<String> keys = strictKeys(user);
        if (user.email() != null) {
            keys.add(user.email().toLowerCase(Locale.ROOT));
        }
        if (user.nickname() != null && !user.nickname().isBlank()) {
            keys.add(user.nickname().toLowerCase(Locale.ROOT));
        }
        return keys;
    }

    private static String buildInitials(Fio fio) {
        StringBuilder sb = new StringBuilder();
        if (fio.hasGivenName()) {
            sb.append(initial(fio.givenName())).append('.');
        }
        if (fio.hasPatronymic()) {
            sb.append(initial(fio.patronymic())).append('.');
        }
        return sb.toString();
    }

    private static String initial(String value) {
        return value == null || value.isBlank() ? "" : value.trim().substring(0, 1);
    }

    private static String localPart(String email) {
        int at = email.indexOf('@');
        return at < 0 ? email : email.substring(0, at);
    }

    /** Нормализация: lowercase, разделители (пробел, точка, подчёркивание, дефис) → один пробел. */
    static String normalize(String value) {
        return value == null
                ? ""
                : value.trim().toLowerCase(Locale.ROOT).replaceAll("[\\s._-]+", " ").trim();
    }

    /** Транслитерация кириллицы в ASCII (детерминированная таблица). */
    static String transliterate(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (char c : value.toLowerCase(Locale.ROOT).toCharArray()) {
            sb.append(translitChar(c));
        }
        return sb.toString();
    }

    private static String translitChar(char c) {
        return switch (c) {
            case 'а' -> "a";
            case 'б' -> "b";
            case 'в' -> "v";
            case 'г' -> "g";
            case 'д' -> "d";
            case 'е', 'ё', 'э' -> "e";
            case 'ж' -> "zh";
            case 'з' -> "z";
            case 'и', 'й' -> "i";
            case 'к' -> "k";
            case 'л' -> "l";
            case 'м' -> "m";
            case 'н' -> "n";
            case 'о' -> "o";
            case 'п' -> "p";
            case 'р' -> "r";
            case 'с' -> "s";
            case 'т' -> "t";
            case 'у' -> "u";
            case 'ф' -> "f";
            case 'х' -> "h";
            case 'ц' -> "ts";
            case 'ч' -> "ch";
            case 'ш' -> "sh";
            case 'щ' -> "sch";
            case 'ъ', 'ь' -> "";
            case 'ы' -> "y";
            case 'ю' -> "yu";
            case 'я' -> "ya";
            default -> Character.isLetterOrDigit(c) ? String.valueOf(c) : "";
        };
    }
}
