package com.dmis.backend.platform.config;

import io.minio.MinioClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioClientConfiguration {

    @Bean
    public MinioClient minioClient(StorageProperties storageProperties) {
        if (storageProperties.secretKey() == null || storageProperties.secretKey().isBlank()) {
            throw new IllegalStateException(
                    "storage.minio.secret-key is missing or blank; set MINIO_SECRET_KEY "
                            + "(должен совпадать с учётными данными MinIO, см. infra/.env.example)"
            );
        }
        return MinioClient.builder()
                .endpoint(storageProperties.endpoint())
                .credentials(storageProperties.accessKey(), storageProperties.secretKey())
                .build();
    }
}
