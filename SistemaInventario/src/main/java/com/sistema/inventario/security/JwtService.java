package com.sistema.inventario.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Servicio para generar y validar tokens JWT con algoritmo HS256.
 * La clave se inyecta desde application.properties (app.jwt.secret).
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final String issuer;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs,
            @Value("${app.jwt.issuer}") String issuer
    ) {
        // Construye una clave HMAC-SHA256 a partir del string.
        // La clave debe tener >= 32 bytes (256 bits).
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
        this.issuer = issuer;
    }

    /**
     * Genera un token JWT firmado para el usuario indicado.
     * Claims incluidos:
     *  - sub: id del usuario
     *  - username: nombre de usuario
     *  - rol: rol del usuario
     */
    public String generateToken(Long userId, String username, String rol) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim("username", username)
                .claim("rol", rol)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Parsea y valida el token. Lanza excepciones si:
     *  - la firma no coincide
     *  - el token está expirado
     *  - el token está malformado
     */
    public Claims parseAndValidate(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}