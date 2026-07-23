package com.sistema.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CambiarPasswordDto {

    @NotBlank(message = "La contrasena actual es obligatoria")
    private String passwordActual;

    @NotBlank(message = "La nueva contrasena es obligatoria")
    @Size(min = 8, max = 128, message = "La nueva contrasena debe tener entre 8 y 128 caracteres")
    private String passwordNueva;

    public String getPasswordActual() {
        return passwordActual;
    }

    public void setPasswordActual(String passwordActual) {
        this.passwordActual = passwordActual;
    }

    public String getPasswordNueva() {
        return passwordNueva;
    }

    public void setPasswordNueva(String passwordNueva) {
        this.passwordNueva = passwordNueva;
    }
}