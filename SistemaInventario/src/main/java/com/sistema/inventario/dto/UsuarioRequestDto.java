package com.sistema.inventario.dto;

import com.sistema.inventario.models.RolUsuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UsuarioRequestDto {

    @NotBlank(message = "El username es obligatorio")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    @Pattern(regexp = "[a-zA-Z0-9_.-]+",
             message = "El username solo puede tener letras, numeros, guion bajo, punto y guion medio")
    private String username;

    @Size(min = 8, max = 128, message = "La contrasena debe tener entre 8 y 128 caracteres")
    private String password;

    private RolUsuario rol;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public RolUsuario getRol() {
        return rol;
    }

    public void setRol(RolUsuario rol) {
        this.rol = rol;
    }
}