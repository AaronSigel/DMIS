package com.dmis.backend.integrations.application.port;

public interface ObjectStoragePort {
    String store(String objectPath, byte[] content, String contentType);

    byte[] load(String storageRef);

    String presignDownload(String storageRef, int ttlSeconds);

    void delete(String storageRef);
}
