package com.dmis.backend.integrations.infra.storage;

import com.dmis.backend.platform.config.StorageProperties;
import io.minio.MinioClient;
import io.minio.errors.ErrorResponseException;
import io.minio.messages.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MinioStorageAdapterTest {

    @Mock
    private MinioClient minioClient;

    @Test
    void deleteCompletesWhenMinIOReturnsNoSuchKey() throws Exception {
        StorageProperties props = new StorageProperties("http://localhost:9000", "k", "s", "dmis-documents", 300);
        ErrorResponse er = new ErrorResponse(
                "NoSuchKey",
                "does not exist",
                "dmis-documents",
                "doc-x/file.bin",
                null,
                null,
                null);
        doThrow(new ErrorResponseException(er, null, "DELETE"))
                .when(minioClient).removeObject(any());

        MinioStorageAdapter adapter = new MinioStorageAdapter(props, minioClient);
        adapter.delete("minio://dmis-documents/doc-x/file.bin");

        verify(minioClient).removeObject(any());
    }

    @Test
    void deletePropagatesOtherMinioErrors() throws Exception {
        StorageProperties props = new StorageProperties("http://localhost:9000", "k", "s", "dmis-documents", 300);
        ErrorResponse er = new ErrorResponse(
                "AccessDenied",
                "denied",
                "dmis-documents",
                "doc-x/file.bin",
                null,
                null,
                null);
        doThrow(new ErrorResponseException(er, null, "DELETE"))
                .when(minioClient).removeObject(any());

        MinioStorageAdapter adapter = new MinioStorageAdapter(props, minioClient);
        assertThrows(IllegalStateException.class, () -> adapter.delete("minio://dmis-documents/doc-x/file.bin"));
    }

    @Test
    void deleteCallsRemoveObjectWhenOk() throws Exception {
        StorageProperties props = new StorageProperties("http://localhost:9000", "k", "s", "dmis-documents", 300);
        doNothing().when(minioClient).removeObject(any());

        MinioStorageAdapter adapter = new MinioStorageAdapter(props, minioClient);
        adapter.delete("minio://dmis-documents/doc-id/file.txt");

        verify(minioClient).removeObject(any());
    }
}
