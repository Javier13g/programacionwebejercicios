package com.sistema.inventario.dto;

import com.sistema.inventario.models.RolUsuario;

public class LoginResponseDto {

    private boolean success;
    private String message;
    private Long id;
    private String username;
    private RolUsuario rol;
    private String token;
    private String tokenType;
    private long expiresInMs;

    public LoginResponseDto() {
    }

    public LoginResponseDto(boolean success, String message, Long id, String username, RolUsuario rol) {
        this.success = success;
        this.message = message;
        this.id = id;
        this.username = username;
        this.rol = rol;
        this.token = null;
        this.tokenType = null;
        this.expiresInMs = 0L;
    }

    public LoginResponseDto(boolean success, String message, Long id, String username,
            RolUsuario rol, String token, String tokenType, long expiresInMs) {
        this.success = success;
        this.message = message;
        this.id = id;
        this.username = username;
        this.rol = rol;
        this.token = token;
        this.tokenType = tokenType;
        this.expiresInMs = expiresInMs;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public RolUsuario getRol() {
        return rol;
    }

    public void setRol(RolUsuario rol) {
        this.rol = rol;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresInMs() {
        return expiresInMs;
    }
}