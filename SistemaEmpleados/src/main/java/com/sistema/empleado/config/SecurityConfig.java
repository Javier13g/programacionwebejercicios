package com.sistema.empleado.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.sistema.empleado.security.JwtAuthFilter;
import com.sistema.empleado.security.JwtService;

/**
 * Configuración de Spring Security:
 *  - Stateless (sin sesión HTTP, usamos JWT)
 *  - Rutas públicas: login y Swagger
 *  - Todo lo demás requiere JWT (validado por JwtAuthFilter)
 *  - CSRF desactivado porque es una API REST
 */
@Configuration
public class SecurityConfig {

    /**
     * Creamos UNA sola instancia del JwtAuthFilter como bean de Spring,
     * manualmente. Asi no hay doble registro.
     */
    @Bean
    public JwtAuthFilter jwtAuthFilter(JwtService jwtService) {
        return new JwtAuthFilter(jwtService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/usuarios/login").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}