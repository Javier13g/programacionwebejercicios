package com.sistema.empleado.security;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistema.empleado.dto.ApiError;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro que valida el token JWT en cada request HTTP.
 * Si la ruta es pública, deja pasar. Si no, exige token válido.
 */
// NO tiene @Component a propósito: lo creamos como bean en SecurityConfig
// para tener UNA sola instancia registrada SOLO en la cadena de Spring Security.
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    // Inyeccion por constructor (mejor que @Autowired en campos)
    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Spring Security sabe qué rutas son públicas gracias a SecurityConfig,
     * pero este método se ejecuta ANTES del dispatcher, así que actuamos
     * desde acá para devolver errores limpios en JSON.
     */
    private boolean isPublicPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Login
        if ("POST".equalsIgnoreCase(method) && path.equals("/usuarios/login")) {
            return true;
        }

        // Recuperación de contraseña (forgot / reset)
        // Acepta cualquier método HTTP: POST para enviar/validar, GET para consultar estado.
        if (path.startsWith("/auth/")) {
            return true;
        }

        // Swagger / OpenAPI
        return path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.equals("/swagger-ui.html")
                || path.contains("swagger-ui")
                || path.endsWith(".css")
                || path.endsWith(".js")
                || path.endsWith(".png")
                || path.endsWith(".html");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Rutas públicas: pasan sin validar
        if (isPublicPath(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeUnauthorized(request, response,
                    "Token JWT requerido. Enviá 'Authorization: Bearer <token>'.");
            return;
        }

        String token = authHeader.substring(7).trim();

        try {
            Claims claims = jwtService.parseAndValidate(token);

            String rol = claims.get("rol", String.class);
            String userId = claims.getSubject();

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + rol))
                    );

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (JwtException e) {
            writeUnauthorized(request, response,
                    "Token JWT inválido o expirado: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
        SecurityContextHolder.clearContext();
    }

    private void writeUnauthorized(HttpServletRequest request,
                                   HttpServletResponse response,
                                   String message) throws IOException {
        ApiError error = new ApiError(
                401,
                "Unauthorized",
                message,
                request.getRequestURI()
        );
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), error);
    }
}