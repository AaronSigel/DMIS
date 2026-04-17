package com.dmis.backend.documents.application;

import java.util.ArrayList;
import java.util.List;

final class TextChunker {
    private final int chunkSize;
    private final int overlap;

    TextChunker(int chunkSize, int overlap) {
        if (chunkSize <= 0) {
            throw new IllegalArgumentException("chunkSize must be > 0");
        }
        if (overlap < 0 || overlap >= chunkSize) {
            throw new IllegalArgumentException("overlap must be in [0, chunkSize)");
        }
        this.chunkSize = chunkSize;
        this.overlap = overlap;
    }

    List<String> chunk(String text) {
        String normalized = normalize(text);
        if (normalized.isBlank()) {
            return List.of();
        }

        List<String> chunks = new ArrayList<>();
        int start = 0;
        while (start < normalized.length()) {
            int end = Math.min(start + chunkSize, normalized.length());
            end = snapToWhitespace(normalized, start, end);
            String chunk = normalized.substring(start, end).trim();
            if (!chunk.isEmpty()) {
                chunks.add(chunk);
            }
            if (end >= normalized.length()) {
                break;
            }
            start = Math.max(0, end - overlap);
        }
        return chunks;
    }

    private static int snapToWhitespace(String s, int start, int end) {
        if (end >= s.length()) {
            return s.length();
        }
        int i = end;
        int lowerBound = Math.min(s.length(), start + Math.max(64, (end - start) / 2));
        while (i > lowerBound) {
            char c = s.charAt(i - 1);
            if (Character.isWhitespace(c)) {
                return i;
            }
            i--;
        }
        return end;
    }

    private static String normalize(String text) {
        if (text == null) {
            return "";
        }
        return text.replace('\u0000', ' ')
                .replaceAll("\\s+", " ")
                .trim();
    }
}

