// filepath: SistemaEmpleados/src/main/java/com/sistema/empleado/models/PasswordResetCode.java
package com.sistema.empleado.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Código numérico de 6 dígitos enviado por SMS al empleado para reset
 * de contraseña. Se guarda HASHEADO (BCrypt) para que un dump de BD
 * no permita resetear cuentas.
 */
@Entity
@Table(name = "password_reset_codes")
public class PasswordResetCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Hash BCrypt del código de 6 dígitos. NO se guarda el código en claro. */
    @Column(name = "code_hash", nullable = false, length = 60)
    private String codeHash;

    /** Teléfono (en formato E.164, p.ej. +5491145551234) al que se envió. */
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    /** Usuario dueño del código. Único: solo un código activo por usuario. */
    @OneToOne(fetch = FetchType.LAZY, targetEntity = UsuariosModel.class)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private UsuariosModel usuario;

    /** Cuándo expira (p.ej. 5 minutos). */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** Si ya fue usado (true tras cambiar la contraseña). */
    @Column(name = "used", nullable = false)
    private boolean used = false;

    /** Intentos fallidos de verificación (rate-limit / lockout). */
    @Column(name = "attempts", nullable = false)
    private int attempts = 0;

    /** Twilio messageId, útil para soporte / logs. */
    @Column(name = "sms_message_id", length = 64)
    private String smsMessageId;

    public PasswordResetCode() {}

    public PasswordResetCode(String codeHash, String phone, UsuariosModel usuario,
                             LocalDateTime expiresAt, String smsMessageId) {
        this.codeHash = codeHash;
        this.phone = phone;
        this.usuario = usuario;
        this.expiresAt = expiresAt;
        this.smsMessageId = smsMessageId;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodeHash() { return codeHash; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public UsuariosModel getUsuario() { return usuario; }
    public void setUsuario(UsuariosModel usuario) { this.usuario = usuario; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public String getSmsMessageId() { return smsMessageId; }
    public void setSmsMessageId(String smsMessageId) { this.smsMessageId = smsMessageId; }
}
