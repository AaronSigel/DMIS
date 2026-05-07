package com.dmis.backend.auth.application.port;

/**
 * Порт ограничения частоты для попыток аутентификации.
 * Реализация хранится в infra-слое и не должна протекать в api/application.
 */
public interface RateLimiterPort {
    /**
     * Пытается списать один токен из бакета, идентифицируемого ключом.
     *
     * @param key идентификатор клиента (например, IP-адрес)
     * @return вердикт: разрешено ли действие и через сколько секунд можно повторить
     */
    Verdict tryConsume(String key);

    record Verdict(boolean allowed, long retryAfterSeconds) {
    }
}
