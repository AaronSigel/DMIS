package com.dmis.backend.platform.crypto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class AesGcmCryptoService {
    private static final int KEY_BYTES = 32;
    private static final int NONCE_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final SecureRandom secureRandom = new SecureRandom();
    private final byte[] keyBytes;

    public AesGcmCryptoService(@Value("${integrations.crypto.key:}") String base64Key) {
        this.keyBytes = decodeKeyOrNull(base64Key);
    }

    public String encryptToBase64(String plaintext) {
        requireKeyConfigured();
        if (plaintext == null) {
            throw new IllegalArgumentException("plaintext is required");
        }
        SecretKey key = new SecretKeySpec(keyBytes, "AES");
        byte[] nonce = new byte[NONCE_BYTES];
        secureRandom.nextBytes(nonce);
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, nonce));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] combined = new byte[nonce.length + ciphertext.length];
            System.arraycopy(nonce, 0, combined, 0, nonce.length);
            System.arraycopy(ciphertext, 0, combined, nonce.length, ciphertext.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception ex) {
            throw new IllegalStateException("Encryption failed: " + ex.getMessage(), ex);
        }
    }

    public String decryptFromBase64(String base64Payload) {
        requireKeyConfigured();
        if (base64Payload == null || base64Payload.isBlank()) {
            throw new IllegalArgumentException("payload is required");
        }
        SecretKey key = new SecretKeySpec(keyBytes, "AES");
        byte[] combined;
        try {
            combined = Base64.getDecoder().decode(base64Payload);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("payload is not valid base64");
        }
        if (combined.length < NONCE_BYTES + 1) {
            throw new IllegalArgumentException("payload is too short");
        }
        byte[] nonce = new byte[NONCE_BYTES];
        byte[] ciphertext = new byte[combined.length - NONCE_BYTES];
        System.arraycopy(combined, 0, nonce, 0, NONCE_BYTES);
        System.arraycopy(combined, NONCE_BYTES, ciphertext, 0, ciphertext.length);
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, nonce));
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new IllegalStateException("Decryption failed: " + ex.getMessage(), ex);
        }
    }

    private void requireKeyConfigured() {
        if (keyBytes == null) {
            throw new IllegalStateException("INTEGRATIONS_CRYPTO_KEY is required");
        }
    }

    private static byte[] decodeKeyOrNull(String base64Key) {
        if (base64Key == null || base64Key.isBlank()) {
            return null;
        }
        byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(base64Key.trim());
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("INTEGRATIONS_CRYPTO_KEY must be base64");
        }
        if (decoded.length != KEY_BYTES) {
            throw new IllegalStateException("INTEGRATIONS_CRYPTO_KEY must be 32 bytes (base64)");
        }
        return decoded;
    }
}

