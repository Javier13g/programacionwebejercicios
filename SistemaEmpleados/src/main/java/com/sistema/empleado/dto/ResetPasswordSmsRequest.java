// filepath: SistemaEmpleados/src/main/java/com/sistema/empleado/dto/ResetPasswordSmsRequest.java
package com.sistema.empleado.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Body de POST /auth/reset-password-sms.
 * El frontend envía lo que el usuario tipeó: teléfono, código de 6 dígitos y nueva contraseña.
 */
public class ResetPasswordSmsRequest {

    @NotBlank
    @Pattern(
        regexp = "^\\+[1-9]\\d{6,14}$",
        message = "El teléfono debe estar en formato E.164"
    )
    private String telefono;

    @NotBlank
    @Pattern(regexp = "^\\d{6}$", message = "El código debe tener exactamente 6 dígitos")
    private String codigo;

    @NotBlank
    @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
    private String newPassword;

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
