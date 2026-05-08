package com.dmis.backend.integrations.application;

/**
 * Сбой операции объектного хранилища (MinIO и т.п.): сообщение для логов/API и
 * при необходимости код ответа провайдера (S3 error code), без секретов.
 */
public class ObjectStorageException extends RuntimeException {

    private final String providerErrorCode;

    public ObjectStorageException(String message, Throwable cause, String providerErrorCode) {
        super(message, cause);
        this.providerErrorCode = providerErrorCode;
    }

    /**
     * Код ошибки S3-совместимого API, если есть (например AccessDenied, NoSuchBucket).
     */
    public String getProviderErrorCode() {
        return providerErrorCode;
    }
}
