package com.sistema.empleado.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sistema.empleado.dto.ApiError;
import com.sistema.empleado.dto.ForgotPasswordSmsRequest;
import com.sistema.empleado.dto.ResetPasswordSmsRequest;
import com.sistema.empleado.services.PasswordResetService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private PasswordResetService passwordResetService;

    // =====================================================================
    //  CANAL SMS (código numérico de 6 dígitos vía Twilio)
    // =====================================================================

    /**
     * POST /auth/forgot-password-sms
     * Body: { "telefono": "+5491145551234" }
     *
     * Siempre responde 200 con el mismo mensaje para no revelar si el
     * teléfono existe. El código de 6 dígitos llega al teléfono si:
     *   - pertenece a un empleado activo
     *   - el empleado tiene un usuario activo (no deleted)
     *
     * Twilio configurado vía env vars:
     *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
     */
    @PostMapping("/forgot-password-sms")
    public ResponseEntity<?> forgotPasswordSms(
            @Valid @RequestBody ForgotPasswordSmsRequest dto,
            HttpServletRequest request) {
        try {
            passwordResetService.solicitarResetPorSms(dto.getTelefono());
        } catch (Exception ex) {
            ApiError error = new ApiError(
                    500,
                    "Internal Server Error",
                    "No se pudo procesar la solicitud. Intentá nuevamente más tarde.",
                    request.getRequestURI()
            );
            return ResponseEntity.status(500).body(error);
        }

        return ResponseEntity.ok().body(java.util.Map.of(
                "message",
                "Si el teléfono está registrado, recibirás un código de 6 dígitos para restablecer tu contraseña."
        ));
    }

    /**
     * POST /auth/reset-password-sms
     * Body: { "telefono": "+5491145551234", "codigo": "123456", "newPassword": "nueva123" }
     *
     * 200 si la contraseña se cambió OK.
     * 400 si el código es inválido, expiró, se agotaron los intentos, el empleado
     *    ya no está activo, o la password es muy corta.
     */
    @PostMapping("/reset-password-sms")
    public ResponseEntity<?> resetPasswordSms(
            @Valid @RequestBody ResetPasswordSmsRequest dto,
            HttpServletRequest request) {

        boolean ok = passwordResetService.resetearPasswordPorCodigo(
                dto.getTelefono(), dto.getCodigo(), dto.getNewPassword());

        if (ok) {
            return ResponseEntity.ok().body(java.util.Map.of(
                    "message",
                    "Contraseña actualizada correctamente. Ya podés iniciar sesión."
            ));
        }

        ApiError error = new ApiError(
                400,
                "Bad Request",
                "El código es inválido, expiró, ya fue utilizado o superaste los intentos permitidos.",
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(error);
    }
}