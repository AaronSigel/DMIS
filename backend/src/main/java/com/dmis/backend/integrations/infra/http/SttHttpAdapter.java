package com.dmis.backend.integrations.infra.http;

import com.dmis.backend.integrations.application.port.SttPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class SttHttpAdapter implements SttPort {

    private final RestClient restClient;

    public SttHttpAdapter(@Value("${stt.base-url:http://stt-service:5000}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Override
    public String transcribe(byte[] audioBytes, String language) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("audio", new ByteArrayResource(audioBytes) {
            @Override
            public String getFilename() {
                return "audio.wav";
            }
        });
        body.add("language", language);

        TranscribeResponse response = restClient.post()
                .uri("/stt/transcribe")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(TranscribeResponse.class);

        if (response == null || response.text() == null) {
            throw new IllegalStateException("STT service returned empty transcription");
        }
        return response.text();
    }

    private record TranscribeResponse(String text) {
    }
}
