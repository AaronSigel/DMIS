package com.dmis.backend.integrations.infra.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Регистрирует {@link JavaMailSender} только при заданном {@code mail.smtp.host}.
 * Если SMTP не сконфигурирован — бин не создаётся, отправка деградирует в no-op
 * (см. {@link com.dmis.backend.integrations.infra.http.MailCalendarHttpAdapter}).
 * Spring Boot {@code MailSenderAutoConfiguration} здесь не используется намеренно:
 * пустой {@code spring.mail.host} всё равно триггерит auto-config и ломает тесты.
 */
@Configuration
public class SmtpMailSenderConfig {

    @Bean
    @ConditionalOnExpression("'${mail.smtp.host:}' != ''")
    public JavaMailSender javaMailSender(
            @Value("${mail.smtp.host:}") String host,
            @Value("${mail.smtp.port:25}") int port,
            @Value("${mail.smtp.username:}") String username,
            @Value("${mail.smtp.password:}") String password,
            @Value("${mail.smtp.auth:false}") boolean auth,
            @Value("${mail.smtp.starttls:false}") boolean starttls,
            @Value("${mail.smtp.connect-timeout-ms:5000}") int connectTimeoutMs,
            @Value("${mail.smtp.read-timeout-ms:10000}") int readTimeoutMs,
            @Value("${mail.smtp.write-timeout-ms:10000}") int writeTimeoutMs
    ) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        if (username != null && !username.isBlank()) {
            sender.setUsername(username);
        }
        if (password != null && !password.isBlank()) {
            sender.setPassword(password);
        }
        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", Boolean.toString(auth));
        props.put("mail.smtp.starttls.enable", Boolean.toString(starttls));
        props.put("mail.smtp.connectiontimeout", Integer.toString(connectTimeoutMs));
        props.put("mail.smtp.timeout", Integer.toString(readTimeoutMs));
        props.put("mail.smtp.writetimeout", Integer.toString(writeTimeoutMs));
        return sender;
    }
}
