package com.recipeplatform.config;

import com.recipeplatform.security.JwtFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf(AbstractHttpConfigurer::disable);

        httpSecurity.authorizeHttpRequests(auth ->
                auth.
                        requestMatchers("/api/v1/auth/test", "/api/v1/auth/reminder-dismiss", "/api/v1/auth/profile", "/api/v1/auth/complete-profile", "/api/v1/auth/change-password").authenticated()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Reference data — public (no JWT needed for profile wizard & chef form)
                        .requestMatchers(HttpMethod.GET, "/api/v1/reference/**").permitAll()
                        // Recommendations require login
                        .requestMatchers("/api/v1/recommendations/**").authenticated()
                        // Recipe mutations require login
                        .requestMatchers(HttpMethod.POST, "/api/v1/recipes").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/recipes/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/recipes/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/recipes/**").authenticated()
                        .anyRequest().permitAll()
        );

        httpSecurity.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        httpSecurity.formLogin(AbstractHttpConfigurer::disable);
        httpSecurity.httpBasic(AbstractHttpConfigurer::disable);

        httpSecurity.
                exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write(String.format("""
                                        {
                                          "timestamp": "%s",
                                          "status": 401,
                                          "error": "Unauthorized",
                                          "message": "Authentication failed: Invalid or expired token",
                                          "path": "%s",
                                          "errorCode": "UNAUTHORIZED"
                                        }
                                    """, java.time.LocalDateTime.now(), request.getRequestURI()));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write(String.format("""
                                        {
                                          "timestamp": "%s",
                                          "status": 403,
                                          "error": "Forbidden",
                                          "message": "Access denied: You do not have permission to access this resource",
                                          "path": "%s",
                                          "errorCode": "ACCESS_DENIED"
                                        }
                                    """, java.time.LocalDateTime.now(), request.getRequestURI()));
                        })
                );


        return httpSecurity.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}

