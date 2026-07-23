package com.sistema.inventario.services;

import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.sistema.inventario.dto.ImagenProductoResponseDto;
import com.sistema.inventario.exceptions.ImageUploadException;

/**
 * Servicio para subir/borrar imagenes en Imgur.
 *
 * Flujo:
 *  1) Cliente (Angular) sube el archivo a este endpoint.
 *  2) Spring lo manda a Imgur con la API key (Authorization: Client-ID ...).
 *  3) Imgur devuelve URL publica + deleteHash.
 *  4) Guardamos ambos en ProductosModel (URL visible, hash interno).
 *
 * La API key se inyecta desde app.imgur.client-id en application.properties.
 */
@Service
public class ImgurService {

    private static final String IMGUR_UPLOAD_URL = "https://api.imgur.com/3/image";
    private static final long MAX_SIZE_BYTES = 10L * 1024L * 1024L; // 10 MB

    private final RestTemplate restTemplate = new RestTemplate();

    private final String clientId;

    public ImgurService(@Value("${app.imgur.client-id:}") String clientId) {
        this.clientId = clientId;
    }

    /**
     * Sube una imagen (recibida como base64) a Imgur y devuelve la respuesta.
     *
     * @param base64Image  contenido del archivo en base64 (sin prefijo data:image/...;base64,)
     * @param mimeType     ej: "image/png", "image/jpeg"
     * @return URL publica + deleteHash + metadata
     * @throws ImageUploadException si falla la comunicacion o Imgur rechaza la imagen
     */
    public ImagenProductoResponseDto uploadImage(String base64Image, String mimeType) {
        if (clientId == null || clientId.isBlank()) {
            throw new ImageUploadException(
                    "Imgur no configurado. Definir app.imgur.client-id en .env");
        }
        if (base64Image == null || base64Image.isBlank()) {
            throw new ImageUploadException("La imagen esta vacia");
        }

        // Validacion de tamano estimado: base64 -> bytes ≈ length * 0.75
        long tamanoEstimado = (long) (base64Image.length() * 0.75);
        if (tamanoEstimado > MAX_SIZE_BYTES) {
            throw new ImageUploadException(
                    "La imagen excede el maximo permitido (10 MB)");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Client-ID " + clientId);

        // Imgur espera: { "image": "<base64>", "type": "base64" }
        Map<String, String> payload = Map.of(
                "image", base64Image,
                "type", "base64"
        );

        HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> rawResponse = restTemplate.exchange(
                    IMGUR_UPLOAD_URL,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) rawResponse.getBody();
            Map<String, Object> data = extractData(responseBody);
            String link = (String) data.get("link");
            String deletehash = (String) data.get("deletehash");
            Integer width = toInt(data.get("width"));
            Integer height = toInt(data.get("height"));
            Long size = toLong(data.get("size"));

            if (link == null || link.isBlank()) {
                throw new ImageUploadException("Imgur no devolvio URL publica");
            }

            return new ImagenProductoResponseDto(link, deletehash, width, height, size);

        } catch (HttpClientErrorException e) {
            throw new ImageUploadException(
                    "Imgur rechazo la imagen: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(),
                    e);
        } catch (RestClientException e) {
            throw new ImageUploadException(
                    "Error de comunicacion con Imgur: " + e.getMessage(), e);
        }
    }

    /**
     * Borra una imagen en Imgur usando su deleteHash.
     *
     * @param deleteHash el hash que guardamos en ProductosModel.imageDeleteHash
     */
    public void deleteImage(String deleteHash) {
        if (deleteHash == null || deleteHash.isBlank()) {
            throw new ImageUploadException("deleteHash vacio");
        }
        if (clientId == null || clientId.isBlank()) {
            throw new ImageUploadException(
                    "Imgur no configurado. Definir app.imgur.client-id en .env");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Client-ID " + clientId);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(
                    IMGUR_UPLOAD_URL + "/" + deleteHash,
                    HttpMethod.DELETE,
                    request,
                    Map.class
            );
        } catch (HttpClientErrorException.NotFound e) {
            // Si la imagen ya no existe en Imgur, lo tomamos como exito
            // (idempotencia).
        } catch (RestClientException e) {
            throw new ImageUploadException(
                    "Error al borrar la imagen en Imgur: " + e.getMessage(), e);
        }
    }

    /**
     * Helper para decodificar base64 desde el cliente (que puede mandarlo
     * con o sin el prefijo data:image/png;base64,).
     */
    public static String decodeBase64Image(String raw) {
        if (raw == null) return null;
        String limpio = raw.trim();
        int idx = limpio.indexOf("base64,");
        if (idx >= 0) {
            limpio = limpio.substring(idx + "base64,".length());
        }
        // Validamos que sea base64 valido
        try {
            Base64.getDecoder().decode(limpio);
        } catch (IllegalArgumentException e) {
            throw new ImageUploadException("La imagen no es base64 valido");
        }
        return limpio;
    }

    // ---- helpers --------------------------------------------------------

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractData(Map<String, Object> body) {
        if (body == null || !body.containsKey("data")) {
            throw new ImageUploadException("Respuesta de Imgur malformada");
        }
        Object data = body.get("data");
        if (!(data instanceof Map)) {
            throw new ImageUploadException("Campo 'data' de Imgur malformado");
        }
        return (Map<String, Object>) data;
    }

    private Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.intValue();
        try { return Integer.parseInt(o.toString()); }
        catch (NumberFormatException e) { return null; }
    }

    private Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(o.toString()); }
        catch (NumberFormatException e) { return null; }
    }
}