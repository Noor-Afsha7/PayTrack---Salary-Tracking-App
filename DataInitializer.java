
package com.paytrack.config;

import com.paytrack.model.AppUser;
import com.paytrack.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Value("${PAYTRACK_ADMIN_PASSWORD:PayTrack@123}")
    private String adminPassword;

    @Bean
    CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {

                AppUser admin = new AppUser();

                admin.setUsername("admin");
                admin.setPassword(
                        passwordEncoder.encode(adminPassword));
                admin.setRole("ADMIN");

                userRepository.save(admin);

                System.out.println(
                        "PayTrack admin account created.");
            }
        };
    }
}
