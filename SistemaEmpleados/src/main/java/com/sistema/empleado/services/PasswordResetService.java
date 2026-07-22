package com.sistema.empleado.services;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sistema.empleado.models.EmpleadosModel;
import com.sistema.empleado.models.EstadoEmpleado;
import com.sistema.empleado.models.PasswordResetCode;
import com.sistema.empleado.models.UsuariosModel;
import com.sistema.empleado.repositories.IEmpleadosRepository;
import com.sistema.empleado.repositories.IPasswordResetCodeRepository;
import com.sistema.empleado.repositories.IUsuariosRepository;

@Service
public class PasswordResetService {

    @Autowired
    private IUsuariosRepository usuariosRepository;

    @Autowired
    private IEmpleadosRepository empleadosRepository;

    @Autowired
    private IPasswordResetCodeRepository codeRepository;

    @Autowired
    private SmsService smsService;


    /** Ventana para que el usuario ingrese el código de 6 dígitos. SMS expira más rápido. */
    @Value("${app.password-reset.sms-expiration-seconds:60}")
    private long smsExpirationSeconds;

    /** Máximo de intentos fallidos antes de invalidar el código. */
    @Value("${app.password-reset.sms-max-attempts:5}")
    private int smsMaxAttempts;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    // =====================================================================
    //  CANAL SMS (código numérico de 6 dígitos vía Twilio)
    // =====================================================================

    /**
     * Genera un código numérico de 6 dígitos y lo envía por SMS al teléfono
     * del empleado. El teléfono debe estar en formato E.164 (+códigopaís...).
     *
     * SEGURIDAD + TRANSPARENCIA:
     *  - Anti-enumeración: NO revela al frontend si el teléfono existe (siempre 200).
     *  - PERO: persiste el resultado REAL de Twilio (status, errorCode, errorMessage)
     *    para que auditoría y el endpoint /auth/sms-status puedan confirmar
     *    si el mensaje realmente se envió.
     *  - Si Twilio RECHAZA (4xx) o nuestro backend no tiene credenciales,
     *    NO creamos un código válido en BD: el usuario no podrá resetear
     *    contraseña aunque le llegue a aparecer el input en el frontend.
     *
     * Solo empleados activos y con teléfono cargado en la BD reciben el código.
     */
    @Transactional
    public void solicitarResetPorSms(String telefonoE164) {
        if (telefonoE164 == null || telefonoE164.isBlank()) return;
        telefonoE164 = telefonoE164.trim();

        var empleadoOpt = empleadosRepository.findByTelefono(telefonoE164);
        if (empleadoOpt.isEmpty()) {
            System.out.println("[PasswordReset-SMS] Teléfono no registrado: " + telefonoE164);
            return;
        }

        EmpleadosModel empleado = empleadoOpt.get();
        if (empleado.getEstado() != EstadoEmpleado.activo) {
            System.out.println("[PasswordReset-SMS] Teléfono de empleado NO activo ("
                    + empleado.getEstado() + "): " + telefonoE164);
            return;
        }

        var usuarioOpt = usuariosRepository.findByEmpleadoId(empleado.getId());
        if (usuarioOpt.isEmpty() || usuarioOpt.get().isDeleted()) {
            System.out.println("[PasswordReset-SMS] Sin usuario activo para empleado id="
                    + empleado.getId());
            return;
        }
        UsuariosModel usuario = usuarioOpt.get();

        // Rate-limit soft: si ya hay un código activo para este usuario, lo reutilizamos
        // y no generamos uno nuevo.
        var existenteOpt = codeRepository.findByUsuarioId(usuario.getId());
        if (existenteOpt.isPresent()) {
            PasswordResetCode prev = existenteOpt.get();
            if (!prev.isUsed() && !prev.isExpired()) {
                System.out.println("[PasswordReset-SMS] Ya hay un código activo para "
                        + telefonoE164 + " (sid=" + prev.getSmsMessageId() + ")");
                return;
            }
            codeRepository.delete(prev);
        }

        // Generar código de 6 dígitos (zero-padded para 000000-999999).
        String codigo = String.format("%06d", random.nextInt(1_000_000));
        String hash = passwordEncoder.encode(codigo);
        LocalDateTime expires = LocalDateTime.now().plusSeconds(smsExpirationSeconds);

        SmsSendResult smsResult = smsService.enviar(
                telefonoE164,
                "Tu código para restablecer la contraseña de Sistema de Empleados es: "
                        + codigo + " (válido por " + smsExpirationSeconds + " segundos)."
        );

        boolean twilioAcepto = smsResult != null && smsResult.aceptado();

        PasswordResetCode code = new PasswordResetCode(
                hash, telefonoE164, usuario, expires,
                smsResult != null ? smsResult.messageSid() : null
        );
        // Si Twilio rechazó, NO permitimos que el código se use: marcamos como usado.
        if (!twilioAcepto) {
            code.setUsed(true);
        }
        codeRepository.save(code);

        if (twilioAcepto) {
            System.out.println("[PasswordReset-SMS] ✅ Código enviado a " + telefonoE164
                    + " sid=" + smsResult.messageSid()
                    + " expires en " + smsExpirationSeconds + " s");
        } else {
            System.out.println("[PasswordReset-SMS] ❌ SMS a " + telefonoE164
                    + " NO aceptado por Twilio: "
                    + (smsResult != null ? smsResult.error() : "error desconocido"));
        }
    }

    /**
     * Verifica el código y, si es correcto y el empleado sigue activo, cambia la contraseña.
     *
     * Reglas:
     *  - El código se compara contra el HASH en BD con BCrypt.matches.
     *  - Si el código fue marcado como usado por rechazo de Twilio, no se puede usar.
     *  - Cuenta intentos fallidos; tras N (smsMaxAttempts) se invalida el código.
     *  - Si el empleado dejó de estar activo entre la solicitud y el consumo, se rechaza.
     *
     * @return true si se cambió la contraseña, false en cualquier fallo.
     */
    @Transactional
    public boolean resetearPasswordPorCodigo(String telefonoE164, String codigo, String nuevaPassword) {
        if (telefonoE164 == null || codigo == null || nuevaPassword == null) return false;
        telefonoE164 = telefonoE164.trim();
        codigo = codigo.trim();

        PasswordResetCode code = codeRepository.findByPhone(telefonoE164).orElse(null);

        if (code == null || code.isUsed() || code.isExpired()) return false;

        // Rate-limit
        if (code.getAttempts() >= smsMaxAttempts) {
            System.out.println("[PasswordReset-SMS] Código bloqueado por exceso de intentos ("
                    + code.getAttempts() + "/" + smsMaxAttempts + ")");
            code.setUsed(true);
            codeRepository.save(code);
            return false;
        }

        if (!passwordEncoder.matches(codigo, code.getCodeHash())) {
            code.setAttempts(code.getAttempts() + 1);
            codeRepository.save(code);
            System.out.println("[PasswordReset-SMS] Código incorrecto para "
                    + telefonoE164 + " (intento " + code.getAttempts() + "/" + smsMaxAttempts + ")");
            return false;
        }

        UsuariosModel usuario = code.getUsuario();
        EmpleadosModel empleado = usuario.getEmpleado();
        if (empleado == null || empleado.getEstado() != EstadoEmpleado.activo) {
            System.out.println("[PasswordReset-SMS] Código rechazado: empleado ya no está activo ("
                    + (empleado == null ? "null" : empleado.getEstado()) + ")");
            code.setUsed(true);
            codeRepository.save(code);
            return false;
        }

        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuariosRepository.save(usuario);

        code.setUsed(true);
        codeRepository.save(code);

        System.out.println("[PasswordReset-SMS] ✅ Contraseña actualizada vía SMS para "
                + telefonoE164 + " (usuarioId=" + usuario.getId() + ")");
        return true;
    }

}