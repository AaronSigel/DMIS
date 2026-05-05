package com.dmis.backend.integrations.infra.http;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.infra.persistence.MailCalendarPersistenceAdapter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Primary
@Component
public class MailCalendarHttpAdapter implements MailCalendarPort {

    private final MailCalendarPersistenceAdapter persistenceAdapter;
    private final String mailcowBaseUrl;
    private final String sogoBaseUrl;

    public MailCalendarHttpAdapter(
            MailCalendarPersistenceAdapter persistenceAdapter,
            @Value("${mailcow.base-url:}") String mailcowBaseUrl,
            @Value("${sogo.base-url:}") String sogoBaseUrl
    ) {
        this.persistenceAdapter = persistenceAdapter;
        this.mailcowBaseUrl = mailcowBaseUrl;
        this.sogoBaseUrl = sogoBaseUrl;
    }

    @Override
    public IntegrationDtos.MailDraftView saveMailDraft(IntegrationDtos.MailDraftView draftView) {
        return persistenceAdapter.saveMailDraft(draftView);
    }

    @Override
    public IntegrationDtos.CalendarDraftView saveCalendarDraft(IntegrationDtos.CalendarDraftView draftView) {
        return persistenceAdapter.saveCalendarDraft(draftView);
    }

    @Override
    public IntegrationDtos.MailDraftView sendMailDraft(IntegrationDtos.MailDraftView draft) {
        if (mailcowBaseUrl == null || mailcowBaseUrl.isBlank()) {
            return draft;
        }
        try {
            RestClient client = RestClient.builder().baseUrl(mailcowBaseUrl).build();
            client.post()
                    .uri("/api/v1/add/sendmail")
                    .body(new MailcowSendRequest(draft.to(), draft.subject(), draft.body()))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ignored) {
            // external service unavailable — draft already stored
        }
        return draft;
    }

    @Override
    public IntegrationDtos.CalendarDraftView sendCalendarDraft(IntegrationDtos.CalendarDraftView draft) {
        if (sogoBaseUrl == null || sogoBaseUrl.isBlank()) {
            return draft;
        }
        try {
            RestClient client = RestClient.builder().baseUrl(sogoBaseUrl).build();
            client.post()
                    .uri("/SOGo/dav/calendars")
                    .body(new SogoEventRequest(draft.title(), draft.attendees(), draft.startIso(), draft.endIso()))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ignored) {
            // external service unavailable — draft already stored
        }
        return draft;
    }

    @Override
    public IntegrationDtos.FreeBusyView getFreeBusy(String attendee, String startIso, String endIso) {
        if (sogoBaseUrl == null || sogoBaseUrl.isBlank()) {
            return new IntegrationDtos.FreeBusyView(attendee, List.of());
        }
        try {
            RestClient client = RestClient.builder().baseUrl(sogoBaseUrl).build();
            FreeBusyResponse response = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/SOGo/dav/freebusy")
                            .queryParam("attendee", attendee)
                            .queryParam("start", startIso)
                            .queryParam("end", endIso)
                            .build())
                    .retrieve()
                    .body(FreeBusyResponse.class);
            if (response == null || response.busySlots() == null) {
                return new IntegrationDtos.FreeBusyView(attendee, List.of());
            }
            return new IntegrationDtos.FreeBusyView(attendee, response.busySlots());
        } catch (RestClientException ignored) {
            return new IntegrationDtos.FreeBusyView(attendee, List.of());
        }
    }

    private record MailcowSendRequest(String to, String subject, String body) {
    }

    private record SogoEventRequest(String title, List<String> attendees, String startIso, String endIso) {
    }

    private record FreeBusyResponse(List<IntegrationDtos.BusySlot> busySlots) {
    }
}
