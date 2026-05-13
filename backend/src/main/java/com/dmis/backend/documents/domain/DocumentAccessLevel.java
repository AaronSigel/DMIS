package com.dmis.backend.documents.domain;

/**
 * Уровень явного доступа к документу (таблица {@code document_access}).
 *
 * <ul>
 *   <li>{@link #READ} — только чтение.</li>
 *   <li>{@link #WRITE} — чтение и изменение метаданных/содержимого.</li>
 *   <li>{@link #OWNER} — со-владелец, полный доступ (включая удаление).</li>
 * </ul>
 *
 * VIEWER (роль пользователя) даёт только read-доступ даже при WRITE/OWNER grant.
 */
public enum DocumentAccessLevel {
    READ,
    WRITE,
    OWNER
}
