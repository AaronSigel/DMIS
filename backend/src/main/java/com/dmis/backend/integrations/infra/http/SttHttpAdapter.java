package com.dmis.backend.integrations.infra.http;

import com.dmis.backend.integrations.application.port.SttPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.time.Duration;

@Component
public class SttHttpAdapter implements SttPort {

    private final RestClient restClient;
    private final String defaultProfile;

    public SttHttpAdapter(
            @Value("${stt.base-url:http://stt-service:8000}") String baseUrl,
            @Value("${stt.connect-timeout-ms:2000}") int connectTimeoutMs,
            @Value("${stt.read-timeout-ms:60000}") int readTimeoutMs,
            @Value("${stt.default-profile:fast}") String defaultProfile
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMs));
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
        this.defaultProfile = isSupportedProfile(defaultProfile) ? defaultProfile.trim().toLowerCase() : "fast";
    }

    @Override
    public String transcribe(InputStream audioStream, long audioSizeBytes, String language, String profile) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new InputStreamResource(audioStream) {
            @Override
            public String getFilename() {
                return "audio.wav";
            }

            @Override
            public long contentLength() {
                return audioSizeBytes;
            }
        });
        body.add("language", language);
        body.add("profile", normalizeProfile(profile));

        TranscribeResponse response;
        try {
            response = restClient.post()
                    .uri("/stt/transcribe")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(TranscribeResponse.class);
        } catch (RestClientResponseException ex) {
            String responseBody = ex.getResponseBodyAsString();
            String reason = "STT service request failed with status " + ex.getStatusCode().value();
            if (responseBody != null && !responseBody.isBlank()) {
                reason += ": " + responseBody;
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, reason, ex);
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "STT service is unavailable", ex);
        }

        if (response == null || response.text() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "STT service returned empty transcription");
        }
        return response.text();
    }

    private String normalizeProfile(String profile) {
        if (profile == null || profile.isBlank()) {
            return defaultProfile;
        }
        String normalized = profile.trim().toLowerCase();
        if (!isSupportedProfile(normalized)) {
            return defaultProfile;
        }
        return normalized;
    }

    private boolean isSupportedProfile(String profile) {
        if (profile == null) {
            return false;
        }
        String normalized = profile.trim().toLowerCase();
        return normalized.equals("fast") || normalized.equals("accurate");
    }

    private record TranscribeResponse(String text) {
    }
}
