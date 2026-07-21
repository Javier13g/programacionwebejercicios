// filepath: SistemaEmpleados/src/main/java/com/sistema/empleado/services/SmsSendResult.java
package com.sistema.empleado.services;

/**
 * Resultado de un intento de envío de SMS vía Twilio.
 * Permite al caller saber si Twilio aceptó el mensaje y con qué SID.
 */
public record SmsSendResult(
        boolean aceptado,
        String messageSid,    // SID devuelto por Twilio. Útil para tracking.
        String status,        // "queued" | "sent" | "delivered" | "undelivered" | "failed" | "rejected"
        String to,
        String error,         // null si fue OK
        Integer errorCode,    // Código de error oficial de Twilio (ej: 21408 = sin permisos región)
        long timestamp
) {
    public static SmsSendResult simulated(String to) {
        return new SmsSendResult(false, null, "no_record", to, null, null, System.currentTimeMillis());
    }
}
