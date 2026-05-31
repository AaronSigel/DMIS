package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.dto.ActionDtos;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Детерминированная сборка черновиков controlled actions без обязательного LLM-парсера.
 */
@Service
public class ActionDraftBuilder {
    private static final Pattern USER_MENTION_PATTERN = Pattern.compile(
            "([@#])([\\p{L}\\p{N}._-]+(?:\\s+\\p{Lu}[\\p{L}.-]*){0,2})"
    );
    private static final Pattern DATE_PATTERN = Pattern.compile(
            "(?iu)(?:на\\s+)?(\\d{1,2})\\.(\\d{1,2})(?:\\.(\\d{2,4}))?(?:\\.|\\s|$)"
    );
    private static final Pattern TIME_PATTERN = Pattern.compile("(?iu)(?:в\\s+)(\\d{1,2}):(\\d{2})");
    private static final Pattern DURATION_MINUTES_PATTERN = Pattern.compile("(?iu)(?:на\\s+)(\\d+)\\s*(?:минут|мин|minutes|minute|min)");
    private static final String DEFAULT_SUBJECT = "Документ для ознакомления";
    private static final String DEFAULT_BODY = "Коллеги, направляю документ из DMIS.";
    private static final String DEFAULT_MEETING_TITLE = "Встреча";
    private static final LocalTime DEFAULT_START_TIME = LocalTime.of(10, 0);
    private static final int DEFAULT_DURATION_MINUTES = 60;

    private final UserMentionResolver userMentionResolver;

    public ActionDraftBuilder(UserMentionResolver userMentionResolver) {
        this.userMentionResolver = userMentionResolver;
    }

    public ActionDtos.SendEmailEntities buildSendEmail(String userText, List<String> selectedDocumentIds, List<String> linkedDocumentIds) {
        String text = userText == null ? "" : userText.trim();
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User text is required");
        }

        String recipientMention = extractRecipientMention(text);
        if (recipientMention == null) {
            recipientMention = inferRecipientFromText(text);
        }
        if (recipientMention == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing entity field: to");
        }

        List<String> attachments = mergeDocumentIds(selectedDocumentIds, linkedDocumentIds);
        boolean recipientResolved = recipientMention != null && !recipientMention.isBlank();
        java.util.Optional<String> explicitSubject = extractSubject(text);
        java.util.Optional<String> explicitBody = extractBody(text);

        String subject = explicitSubject.orElse(
                !attachments.isEmpty() || recipientResolved ? DEFAULT_SUBJECT : null
        );
        if (subject == null || subject.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing entity field: subject");
        }

        String body = explicitBody.orElse(
                !attachments.isEmpty() || recipientResolved ? DEFAULT_BODY : null
        );
        if (body == null || body.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing entity field: body");
        }

        return new ActionDtos.SendEmailEntities(
                userMentionResolver.resolve(recipientMention),
                subject,
                body,
                attachments
        );
    }

    public ActionDraftBuildResult tryBuildSendEmail(
            String userText,
            List<String> selectedDocumentIds,
            List<String> linkedDocumentIds
    ) {
        String text = userText == null ? "" : userText.trim();
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User text is required");
        }

        List<String> missing = new ArrayList<>();
        Map<String, Object> partial = new LinkedHashMap<>();
        List<String> attachments = mergeDocumentIds(selectedDocumentIds, linkedDocumentIds);
        if (!attachments.isEmpty()) {
            partial.put("attachmentDocumentIds", attachments);
        }

        String recipientMention = extractRecipientMention(text);
        if (recipientMention == null) {
            recipientMention = inferRecipientFromText(text);
        }
        if (recipientMention == null) {
            missing.add("to");
        } else {
            partial.put("to", userMentionResolver.resolve(recipientMention));
        }

        java.util.Optional<String> explicitSubject = extractSubject(text);
        String subject = explicitSubject.orElse(
                !attachments.isEmpty() || recipientMention != null ? DEFAULT_SUBJECT : null
        );
        if (subject == null || subject.isBlank()) {
            missing.add("subject");
        } else {
            partial.put("subject", subject);
        }

        java.util.Optional<String> explicitBody = extractBody(text);
        String body = explicitBody.orElse(
                !attachments.isEmpty() || recipientMention != null ? DEFAULT_BODY : null
        );
        if (body == null || body.isBlank()) {
            missing.add("body");
        } else {
            partial.put("body", body);
        }

        if (!missing.isEmpty()) {
            return ActionDraftBuildResult.clarification(ActionDtos.SEND_EMAIL_INTENT, partial, missing);
        }

        return ActionDraftBuildResult.complete(
                ActionDtos.SEND_EMAIL_INTENT,
                new ActionDtos.SendEmailEntities(
                        (String) partial.get("to"),
                        (String) partial.get("subject"),
                        (String) partial.get("body"),
                        attachments
                )
        );
    }

    public boolean supportsSendEmail(String userText) {
        String text = userText == null ? "" : userText.toLowerCase(Locale.ROOT);
        return text.contains("письм") || text.contains("email") || text.contains("mail");
    }

    public boolean supportsCreateCalendarEvent(String userText) {
        String text = userText == null ? "" : userText.toLowerCase(Locale.ROOT);
        return text.contains("встреч")
                || text.contains("meeting")
                || text.contains("event")
                || text.contains("календар");
    }

    public ActionDtos.CreateCalendarEventEntities buildCreateCalendarEvent(String userText, String organizerEmail) {
        String text = userText == null ? "" : userText.trim();
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User text is required");
        }
        if (organizerEmail == null || organizerEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizer email is required");
        }

        String title = extractMeetingTitle(text).orElse(DEFAULT_MEETING_TITLE);
        title = stripTrailingQuotes(title);

        LocalDate date = extractMeetingDate(text);
        if (date == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing entity field: startIso");
        }

        LocalTime startTime = extractStartTime(text).orElse(DEFAULT_START_TIME);
        int durationMinutes = extractDurationMinutes(text).orElse(DEFAULT_DURATION_MINUTES);

        LocalDateTime start = LocalDateTime.of(date, startTime);
        LocalDateTime end = start.plusMinutes(durationMinutes);
        String startIso = start.toInstant(ZoneOffset.UTC).toString();
        String endIso = end.toInstant(ZoneOffset.UTC).toString();

        List<String> attendees = extractAttendeeMentions(text).stream()
                .map(userMentionResolver::resolve)
                .distinct()
                .toList();
        if (attendees.isEmpty()) {
            attendees = List.of(organizerEmail.trim());
        }

        return new ActionDtos.CreateCalendarEventEntities(title, attendees, startIso, endIso);
    }

    public ActionDraftBuildResult tryBuildCreateCalendarEvent(String userText, String organizerEmail) {
        String text = userText == null ? "" : userText.trim();
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User text is required");
        }
        if (organizerEmail == null || organizerEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizer email is required");
        }

        List<String> missing = new ArrayList<>();
        Map<String, Object> partial = new LinkedHashMap<>();

        String title = extractMeetingTitle(text).orElse(DEFAULT_MEETING_TITLE);
        title = stripTrailingQuotes(title);
        partial.put("title", title);

        LocalDate date = extractMeetingDate(text);
        LocalTime startTime = extractStartTime(text).orElse(DEFAULT_START_TIME);
        int durationMinutes = extractDurationMinutes(text).orElse(DEFAULT_DURATION_MINUTES);

        if (date == null) {
            missing.add("startAt");
        }

        List<String> attendees = extractAttendeeMentions(text).stream()
                .map(userMentionResolver::resolve)
                .distinct()
                .toList();
        if (attendees.isEmpty()) {
            attendees = List.of(organizerEmail.trim());
        }
        partial.put("participants", attendees);

        if (!missing.isEmpty()) {
            return ActionDraftBuildResult.clarification(
                    ActionDtos.CREATE_CALENDAR_EVENT_INTENT,
                    partial,
                    missing
            );
        }

        LocalDateTime start = LocalDateTime.of(date, startTime);
        LocalDateTime end = start.plusMinutes(durationMinutes);
        String startIso = start.toInstant(ZoneOffset.UTC).toString();
        String endIso = end.toInstant(ZoneOffset.UTC).toString();

        return ActionDraftBuildResult.complete(
                ActionDtos.CREATE_CALENDAR_EVENT_INTENT,
                new ActionDtos.CreateCalendarEventEntities(title, attendees, startIso, endIso)
        );
    }

    private static String extractRecipientMention(String text) {
        Matcher matcher = USER_MENTION_PATTERN.matcher(text);
        while (matcher.find()) {
            String mention = matcher.group();
            if (mention.startsWith("#")) {
                return mention;
            }
        }
        matcher = USER_MENTION_PATTERN.matcher(text);
        while (matcher.find()) {
            String mention = matcher.group();
            if (!isLikelyDocumentMention(mention)) {
                return mention;
            }
        }
        return null;
    }

    private static boolean isLikelyDocumentMention(String mention) {
        return mention.startsWith("@") && !mention.contains(" ") && mention.substring(1).contains(".");
    }

    private static String inferRecipientFromText(String text) {
        String normalized = text.toLowerCase(Locale.ROOT);
        if (normalized.contains("project manager") || normalized.contains("менеджер")) {
            return "@manager";
        }
        if (normalized.contains("analyst") || normalized.contains("аналит")) {
            return "@analyst";
        }
        if (normalized.contains("reviewer") || normalized.contains("ревьюер")) {
            return "@reviewer";
        }
        if (normalized.contains("admin") || normalized.contains("админ")) {
            return "@admin";
        }
        return null;
    }

    private static java.util.Optional<String> extractMeetingTitle(String text) {
        Matcher byPreposition = Pattern.compile("(?iu)(?:встреч(?:у|а|е)?|meeting|event)\\s+по\\s+(.+)$")
                .matcher(text.trim());
        if (byPreposition.find()) {
            return java.util.Optional.of(byPreposition.group(1).trim());
        }
        Matcher matcher = Pattern.compile("(?iu)тем(?:ой|а|у)?\\s*[-–—:]\\s*(.+)$").matcher(text.trim());
        if (matcher.find()) {
            return java.util.Optional.of(matcher.group(1).trim());
        }
        return extractSubject(text);
    }

    private static java.util.Optional<String> extractSubject(String text) {
        java.util.regex.Matcher matcher = Pattern.compile("(?iu)(?:с\\s+)?тем(?:ой|а|у)?[:\\s-]+(.+?)(?:\\.|$)").matcher(text);
        if (matcher.find()) {
            return java.util.Optional.of(matcher.group(1).trim());
        }
        return java.util.Optional.empty();
    }

    private static String stripTrailingQuotes(String value) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.length() >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            return trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }

    private static LocalDate extractMeetingDate(String text) {
        String normalized = text.toLowerCase(Locale.ROOT);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        if (normalized.contains("завтра") || normalized.contains("tomorrow")) {
            return today.plusDays(1);
        }
        Matcher matcher = DATE_PATTERN.matcher(text);
        if (!matcher.find()) {
            return null;
        }
        int day = Integer.parseInt(matcher.group(1));
        int month = Integer.parseInt(matcher.group(2));
        int year = today.getYear();
        if (matcher.group(3) != null) {
            year = normalizeYear(Integer.parseInt(matcher.group(3)));
        } else {
            LocalDate candidate = LocalDate.of(year, month, day);
            if (candidate.isBefore(today)) {
                year += 1;
            }
        }
        return LocalDate.of(year, month, day);
    }

    private static int normalizeYear(int rawYear) {
        if (rawYear < 100) {
            return 2000 + rawYear;
        }
        return rawYear;
    }

    private static java.util.Optional<LocalTime> extractStartTime(String text) {
        Matcher matcher = TIME_PATTERN.matcher(text);
        if (!matcher.find()) {
            return java.util.Optional.empty();
        }
        return java.util.Optional.of(LocalTime.of(
                Integer.parseInt(matcher.group(1)),
                Integer.parseInt(matcher.group(2))
        ));
    }

    private static java.util.Optional<Integer> extractDurationMinutes(String text) {
        Matcher matcher = DURATION_MINUTES_PATTERN.matcher(text);
        if (!matcher.find()) {
            return java.util.Optional.empty();
        }
        return java.util.Optional.of(Integer.parseInt(matcher.group(1)));
    }

    private static List<String> extractAttendeeMentions(String text) {
        LinkedHashSet<String> mentions = new LinkedHashSet<>();
        Matcher matcher = USER_MENTION_PATTERN.matcher(text);
        while (matcher.find()) {
            String mention = matcher.group();
            if (!isLikelyDocumentMention(mention)) {
                mentions.add(mention);
            }
        }
        return List.copyOf(mentions);
    }

    private static java.util.Optional<String> extractBody(String text) {
        java.util.regex.Matcher matcher = Pattern.compile("(?iu)(?:текст|body)[:\\s]+(.+?)(?:\\.|$)").matcher(text);
        if (matcher.find()) {
            return java.util.Optional.of(matcher.group(1).trim());
        }
        return java.util.Optional.empty();
    }

    private static List<String> mergeDocumentIds(List<String> selectedDocumentIds, List<String> linkedDocumentIds) {
        Set<String> merged = new LinkedHashSet<>();
        if (selectedDocumentIds != null) {
            selectedDocumentIds.stream()
                    .filter(id -> id != null && !id.isBlank())
                    .map(String::trim)
                    .forEach(merged::add);
        }
        if (linkedDocumentIds != null) {
            linkedDocumentIds.stream()
                    .filter(id -> id != null && !id.isBlank())
                    .map(String::trim)
                    .forEach(merged::add);
        }
        return new ArrayList<>(merged);
    }
}
