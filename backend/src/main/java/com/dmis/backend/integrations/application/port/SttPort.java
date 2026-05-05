package com.dmis.backend.integrations.application.port;

public interface SttPort {
    String transcribe(byte[] audioBytes, String language);
}
