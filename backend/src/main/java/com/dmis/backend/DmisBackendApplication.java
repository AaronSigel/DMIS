package com.dmis.backend;

import com.dmis.backend.assistant.infra.persistence.entity.AssistantThreadEntity;
import com.dmis.backend.assistant.infra.persistence.repository.AssistantThreadJpaRepository;
import com.dmis.backend.documents.infra.persistence.entity.DocumentEntity;
import com.dmis.backend.documents.infra.persistence.repository.DocumentJpaRepository;
import com.dmis.backend.platform.config.JwtProperties;
import com.dmis.backend.platform.config.StorageProperties;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.retry.annotation.EnableRetry;

import java.time.Instant;
import java.util.List;

@SpringBootApplication
@EnableRetry
@EnableConfigurationProperties({JwtProperties.class, StorageProperties.class})
public class DmisBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(DmisBackendApplication.class, args);
    }

    /**
     * Демо-контент: документы (включая один с тегом {@code archive}) и тред
     * ассистента. Запускается только в профиле {@code demo}; в {@code test} не
     * выполняется, чтобы не влиять на JUnit-фикстуры. Идемпотентно: при
     * повторном старте ничего не пишет, если данные уже есть.
     */
    @Bean
    @Profile("demo")
    CommandLineRunner demoContentBootstrap(
            DocumentJpaRepository documents,
            AssistantThreadJpaRepository threads
    ) {
        return args -> {
            if (documents.count() == 0) {
                Instant now = Instant.now();
                documents.saveAll(List.of(
                        new DocumentEntity(
                                "doc-demo-contract",
                                "Контракт NDA с подрядчиком",
                                "u-admin",
                                "demo://nda",
                                "Соглашение о неразглашении между DMIS и подрядчиком. Срок действия 12 месяцев.",
                                "Демо-контракт NDA для проверки RAG-поиска.",
                                List.of("contract"),
                                "demo",
                                "general",
                                now,
                                now,
                                "nda.txt",
                                "text/plain",
                                256L,
                                "INDEXED",
                                1,
                                now
                        ),
                        new DocumentEntity(
                                "doc-demo-memo",
                                "Заметка по релизу 0.4",
                                "u-admin",
                                "demo://memo",
                                "Релиз 0.4: завершить интеграции почты и календаря, зафиксировать smoke-сценарий.",
                                "Внутренняя заметка по плану релиза.",
                                List.of("memo", "pinned"),
                                "demo",
                                "general",
                                now,
                                now,
                                "release-memo.txt",
                                "text/plain",
                                128L,
                                "INDEXED",
                                1,
                                now
                        ),
                        new DocumentEntity(
                                "doc-demo-transcript",
                                "Транскрипт планерки 04.05",
                                "u-admin",
                                "demo://transcript",
                                "Speaker A: обсудим архив. Speaker B: добавим тег archive вместо новой папки.",
                                "Запись командной встречи (демо).",
                                List.of("transcript"),
                                "demo",
                                "general",
                                now,
                                now,
                                "transcript-04-05.txt",
                                "text/plain",
                                512L,
                                "INDEXED",
                                1,
                                now
                        ),
                        new DocumentEntity(
                                "doc-demo-archive",
                                "Старый отчёт 2024 Q3",
                                "u-admin",
                                "demo://archive",
                                "Итоги третьего квартала 2024: KPI выполнены на 87%.",
                                "Архивный отчёт прошлого года.",
                                List.of("report", "archive"),
                                "demo",
                                "general",
                                now,
                                now,
                                "report-q3-2024.txt",
                                "text/plain",
                                384L,
                                "INDEXED",
                                1,
                                now
                        )
                ));
            }
            if (threads.count() == 0) {
                Instant now = Instant.now();
                threads.save(new AssistantThreadEntity(
                        "thread-demo-1",
                        "u-admin",
                        "Подбор почты для NDA",
                        "balanced",
                        "documents",
                        now,
                        now
                ));
            }
        };
    }
}
