package com.tableorder.auth.config;

import com.tableorder.auth.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 인증 불필요
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // 직원 관리: MANAGER 전용
                        .requestMatchers("/api/stores/*/staff/**").hasRole("MANAGER")

                        // 메뉴 조회: MANAGER, TABLE
                        .requestMatchers(HttpMethod.GET, "/api/stores/*/menus/**").hasAnyRole("MANAGER", "TABLE")
                        .requestMatchers(HttpMethod.GET, "/api/stores/*/categories/**").hasAnyRole("MANAGER", "TABLE")

                        // 메뉴/카테고리 CUD: MANAGER 전용
                        .requestMatchers("/api/stores/*/menus/**").hasRole("MANAGER")
                        .requestMatchers("/api/stores/*/categories/**").hasRole("MANAGER")

                        // 주문 생성: TABLE 전용
                        .requestMatchers(HttpMethod.POST, "/api/stores/*/orders").hasRole("TABLE")

                        // 주문 조회: 모든 인증 사용자
                        .requestMatchers(HttpMethod.GET, "/api/stores/*/orders/**").hasAnyRole("MANAGER", "STAFF", "TABLE")

                        // 주문 상태 변경/삭제: MANAGER, STAFF
                        .requestMatchers(HttpMethod.PUT, "/api/stores/*/orders/*/status").hasAnyRole("MANAGER", "STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/stores/*/orders/*").hasAnyRole("MANAGER", "STAFF")

                        // SSE 구독: MANAGER, STAFF
                        .requestMatchers("/api/stores/*/orders/subscribe").hasAnyRole("MANAGER", "STAFF")

                        // 테이블 조회: MANAGER, STAFF
                        .requestMatchers(HttpMethod.GET, "/api/stores/*/tables/**").hasAnyRole("MANAGER", "STAFF")

                        // 테이블 등록: MANAGER
                        .requestMatchers(HttpMethod.POST, "/api/stores/*/tables").hasRole("MANAGER")

                        // 이용 완료, 과거 내역: MANAGER, STAFF
                        .requestMatchers("/api/stores/*/tables/*/complete").hasAnyRole("MANAGER", "STAFF")
                        .requestMatchers("/api/stores/*/tables/*/history").hasAnyRole("MANAGER", "STAFF")

                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
