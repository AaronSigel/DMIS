package com.dmis.backend.documents.application.port;

import java.util.List;

public interface EmbeddingsPort {
    List<float[]> embed(List<String> texts);
}

