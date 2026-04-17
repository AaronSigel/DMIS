package com.dmis.backend.integrations.infra.storage;

import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.platform.config.StorageProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;

@Component
public class MinioStorageAdapter implements ObjectStoragePort {
    private final StorageProperties storageProperties;
    private final MinioClient minioClient;

    public MinioStorageAdapter(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        this.minioClient = MinioClient.builder()
                .endpoint(storageProperties.endpoint())
                .credentials(storageProperties.accessKey(), storageProperties.secretKey())
                .build();
    }

    @Override
    public String store(String objectPath, byte[] content, String contentType) {
        try {
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(storageProperties.bucket()).build());
            if (!bucketExists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(storageProperties.bucket()).build());
            }
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(storageProperties.bucket())
                    .object(objectPath)
                    .contentType(contentType == null ? "application/octet-stream" : contentType)
                    .stream(new ByteArrayInputStream(content), content.length, -1)
                    .build());
            return "minio://" + storageProperties.bucket() + "/" + objectPath;
        } catch (Exception e) {
            throw new IllegalStateException("MinIO upload failed", e);
        }
    }
}
