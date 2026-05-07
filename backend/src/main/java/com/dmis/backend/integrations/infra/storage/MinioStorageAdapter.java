package com.dmis.backend.integrations.infra.storage;

import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.platform.config.StorageProperties;
import io.minio.errors.ErrorResponseException;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Component
public class MinioStorageAdapter implements ObjectStoragePort {
    private final StorageProperties storageProperties;
    private final MinioClient minioClient;

    public MinioStorageAdapter(StorageProperties storageProperties, MinioClient minioClient) {
        this.storageProperties = storageProperties;
        this.minioClient = minioClient;
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

    @Override
    public byte[] load(String storageRef) {
        try (var in = minioClient.getObject(toGetObjectArgs(storageRef))) {
            return in.readAllBytes();
        } catch (IOException e) {
            throw new IllegalStateException("MinIO download failed", e);
        } catch (Exception e) {
            throw new IllegalStateException("MinIO download failed", e);
        }
    }

    @Override
    public String presignDownload(String storageRef, int ttlSeconds) {
        try {
            StorageRef parsed = parseStorageRef(storageRef);
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(parsed.bucket())
                            .object(parsed.objectPath())
                            .expiry(ttlSeconds)
                            .build()
            );
        } catch (Exception e) {
            throw new IllegalStateException("MinIO presign failed", e);
        }
    }

    @Override
    public void delete(String storageRef) {
        try {
            minioClient.removeObject(toRemoveObjectArgs(storageRef));
        } catch (ErrorResponseException e) {
            if (isNoSuchKey(e)) {
                return;
            }
            throw new IllegalStateException("MinIO delete failed", e);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("MinIO delete failed", e);
        }
    }

    private static boolean isNoSuchKey(ErrorResponseException e) {
        return e.errorResponse() != null && "NoSuchKey".equals(e.errorResponse().code());
    }

    private GetObjectArgs toGetObjectArgs(String storageRef) {
        StorageRef parsed = parseStorageRef(storageRef);
        return GetObjectArgs.builder()
                .bucket(parsed.bucket())
                .object(parsed.objectPath())
                .build();
    }

    private RemoveObjectArgs toRemoveObjectArgs(String storageRef) {
        StorageRef parsed = parseStorageRef(storageRef);
        return RemoveObjectArgs.builder()
                .bucket(parsed.bucket())
                .object(parsed.objectPath())
                .build();
    }

    private StorageRef parseStorageRef(String storageRef) {
        if (storageRef == null || !storageRef.startsWith("minio://")) {
            throw new IllegalArgumentException("Invalid storage reference: " + storageRef);
        }
        String value = storageRef.substring("minio://".length());
        int slash = value.indexOf('/');
        if (slash <= 0 || slash == value.length() - 1) {
            throw new IllegalArgumentException("Invalid storage reference: " + storageRef);
        }
        String bucket = value.substring(0, slash);
        String objectPath = value.substring(slash + 1);
        return new StorageRef(bucket, objectPath);
    }

    private record StorageRef(String bucket, String objectPath) {
    }
}
