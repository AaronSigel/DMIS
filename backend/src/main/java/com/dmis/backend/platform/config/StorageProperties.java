package com.dmis.backend.platform.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "storage.minio")
public record StorageProperties(
        String endpoint,
        String accessKey,
        String secretKey,
        String bucket,
        int presignedDownloadTtlSeconds
) {
}
