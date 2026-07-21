// filepath: SistemaEmpleados/src/main/java/com/sistema/empleado/dto/ForgotPasswordSmsRequest.java
package com.sistema.empleado.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Body de POST /auth/forgot-password-sms.
 * Se envía el código al TELÉFONO del empleado (formato E.164).
 *
 * Ejemplos válidos: +5491145551234, +14155552671, +34612345678
 */
public class ForgotPasswordSmsRequest {

    @NotBlank
    @Pattern(
        regexp = "^\\+[1-9]\\d{6,14}$",
        message = "El teléfono debe estar en formato E.164: +códigoPaís + número (ej. +5491145551234)"
    )
    private String telefono;

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}
