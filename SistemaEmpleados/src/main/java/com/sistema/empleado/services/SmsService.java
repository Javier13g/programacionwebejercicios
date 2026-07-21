// filepath: SistemaEmpleados/src/main/java/com/sistema/empleado/services/SmsService.java
package com.sistema.empleado.services;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Servicio de envío de SMS vía API HTTP de Twilio.
 * Documentación: https://www.twilio.com/docs/sms/api
 *
 * Decisión: usamos la API HTTP directa (no el SDK de Twilio) para:
 *   - Evitar sumar dependencias pesadas al pom.xml
 *   - Reutilizar el RestClient ya configurado en el proyecto
 *   - Auth simple: HTTP Basic con AccountSID:AuthToken
 *
 * Formato del destinatario: E.164 (+códigopaís + número). Twilio lo exige.
 */
@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);
    private static final String TWILIO_MESSAGES_URL =
            "https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json";

    private final RestClient restClient;

    @Value("${app.sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String authToken;

    @Value("${app.sms.twilio.from:}")
    private String from; // número Twilio comprado, formato E.164

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public SmsService() {
        this.restClient = RestClient.builder().build();
    }

    /**
     * Envía un SMS al número destino (en formato E.164).
     *
     * @return SmsSendResult con el messageSid de Twilio o el motivo de fallo.
     *         messageSid sirve para consultar estado en GET .../Messages/{sid}.json
     *         o recibir el webhook de delivery.
     */
    public SmsSendResult enviar(String toE164, String body) {
        // Modo dev sin credenciales: solo si NO estamos en prod.
        if (accountSid == null || accountSid.isBlank()
                || authToken == null || authToken.isBlank()
                || from == null || from.isBlank()) {

            boolean esDev = "dev".equals(activeProfile) || "default".equals(activeProfile);
            if (esDev) {
                log.warn("[SmsService] Twilio no configurado. Simulando envío a {}", toE164);
                log.info("  SMS:\n{}", body);
                return SmsSendResult.simulated(toE164);
            }
            String msg = "[SmsService] ❌ Twilio sin configurar en profile '"
                    + activeProfile + "'. SMS a " + toE164 + " NO enviado.";
            log.error(msg);
            return new SmsSendResult(false, null, "rejected", toE164, msg, null,
                    System.currentTimeMillis());
        }

        if (toE164 == null || !toE164.startsWith("+")) {
            String msg = "Teléfono destino inválido (debe ser E.164 con +): " + toE164;
            log.error("[SmsService] {}", msg);
            return new SmsSendResult(false, null, "rejected", toE164, msg, null,
                    System.currentTimeMillis());
        }

        try {
            // Twilio espera application/x-www-form-urlencoded con Basic Auth.
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("To", toE164);
            form.add("From", from);
            form.add("Body", body);

            String basic = Base64.getEncoder().encodeToString(
                    (accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));

            TwilioMessageResponse resp = restClient.post()
                    .uri(URI.create(TWILIO_MESSAGES_URL.replace("{accountSid}", accountSid)))
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + basic)
                    .body(form)
                    .retrieve()
                    .body(TwilioMessageResponse.class);

            String sid = resp != null ? resp.sid() : null;
            String status = resp != null ? resp.status() : null;
            log.info("[SmsService] SMS aceptado por Twilio. to={} sid={} status={}",
                    toE164, sid, status);

            return new SmsSendResult(true, sid, status, toE164, null, null,
                    System.currentTimeMillis());

        } catch (RestClientException ex) {
            // Twilio devuelve 4xx con cuerpo JSON que tiene {code,message,more_info,status}.
            // Hacemos el mejor esfuerzo de parsearlo para que la BD refleje el motivo
            // EXACTO del fallo (no un mensaje genérico).
            Integer twilioErrorCode = null;
            String twilioErrorMessage = ex.getMessage();
            try {
                String errorBody = ex.getMessage();
                if (errorBody != null && errorBody.contains("\"code\"")) {
                    int ci = errorBody.indexOf("\"code\":");
                    if (ci > 0) {
                        String tail = errorBody.substring(ci + 7);
                        int endIdx = tail.indexOf(',');
                        String num = (endIdx > 0 ? tail.substring(0, endIdx) : tail).trim();
                        if (num.matches("\\d+")) twilioErrorCode = Integer.parseInt(num);
                    }
                    int mi = errorBody.indexOf("\"message\":\"");
                    if (mi > 0) {
                        String tail = errorBody.substring(mi + 11);
                        int endIdx = tail.indexOf("\",");
                        if (endIdx > 0) twilioErrorMessage = tail.substring(0, endIdx);
                    }
                }
            } catch (Exception ignore) {
                // Si falla el parseo, nos quedamos con el mensaje crudo.
            }
            log.error("[SmsService] Error enviando SMS a {}: code={} msg={}",
                    toE164, twilioErrorCode, twilioErrorMessage, ex);
            return new SmsSendResult(false, null, "failed", toE164, twilioErrorMessage,
                    twilioErrorCode, System.currentTimeMillis());
        }
    }


    /** Respuesta de Twilio al crear un mensaje. Campos más relevantes. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TwilioMessageResponse(
            @JsonProperty("sid") String sid,
            @JsonProperty("status") String status, // queued | sent | failed | delivered | undelivered
            @JsonProperty("to") String to,
            @JsonProperty("from") String from,
            @JsonProperty("error_code") Integer errorCode,
            @JsonProperty("error_message") String errorMessage
    ) {}

    /**
     * Lookup de cuenta Twilio (útil como health-check para validar credenciales).
     * Devuelve null si falla.
     */
    public Map<String, Object> validarCredenciales() {
        if (accountSid == null || accountSid.isBlank()
                || authToken == null || authToken.isBlank()) {
            return null;
        }
        try {
            String basic = Base64.getEncoder().encodeToString(
                    (accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));
            Map<String, Object> resp = restClient.get()
                    .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/"
                            + accountSid + ".json"))
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + basic)
                    .retrieve()
                    .body(LinkedHashMap.class);
            return resp;
        } catch (RestClientException ex) {
            log.error("[SmsService] Credenciales Twilio inválidas: {}", ex.getMessage());
            return null;
        }
    }
}
