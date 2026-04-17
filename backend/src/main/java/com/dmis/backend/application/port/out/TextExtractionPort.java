package com.dmis.backend.documents.application.port;

public interface TextExtractionPort {
    String extract(String fileName, byte[] content, String contentType);
}

