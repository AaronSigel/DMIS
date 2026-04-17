package com.dmis.backend;

import com.dmis.backend.platform.config.JwtProperties;
import com.dmis.backend.platform.config.StorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, StorageProperties.class})
public class DmisBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(DmisBackendApplication.class, args);
    }
}
