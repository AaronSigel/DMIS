package com.dmis.backend.adapters.outbound.integration;

import com.dmis.backend.documents.application.port.TextExtractionPort;
import org.apache.tika.Tika;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;

@Component
public class TikaTextExtractionAdapter implements TextExtractionPort {
    private final Tika tika = new Tika();

    @Override
    public String extract(String fileName, byte[] content, String contentType) {
        try {
            if (content == null || content.length == 0) {
                return "";
            }
            return tika.parseToString(new ByteArrayInputStream(content));
        } catch (Exception e) {
            throw new IllegalStateException("Text extraction failed for " + fileName, e);
        }
    }
}

