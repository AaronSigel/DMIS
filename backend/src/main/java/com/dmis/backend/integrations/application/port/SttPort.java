package com.dmis.backend.integrations.application.port;

import java.io.InputStream;

public interface SttPort {
    String transcribe(InputStream audioStream, long audioSizeBytes, String language, String profile);
}
