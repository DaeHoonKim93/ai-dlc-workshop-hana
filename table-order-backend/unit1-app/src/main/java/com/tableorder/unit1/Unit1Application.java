package com.tableorder.unit1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.tableorder")
@EntityScan(basePackages = "com.tableorder.auth.entity")
@EnableJpaRepositories(basePackages = "com.tableorder.auth.repository")
public class Unit1Application {

    public static void main(String[] args) {
        SpringApplication.run(Unit1Application.class, args);
    }
}
