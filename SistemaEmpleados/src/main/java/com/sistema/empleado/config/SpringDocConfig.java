package com.sistema.empleado.config;

import java.util.ArrayList;
import java.util.Arrays;

import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Pageable;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.parameters.QueryParameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class SpringDocConfig {

    /**
     * Le dice a Swagger que TODA la API usa Bearer JWT, excepto los endpoints
     * marcados como publicos (login, swagger). Eso hace aparecer el candado
     * "Authorize" en la UI.
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .addServersItem(new Server().url("/").description("Ruta Relativa del Contenedor"))
                .info(new Info()
                        .title("Sistema de Empleados API")
                        .version("1.0")
                        .description("API REST del sistema de empleados con autenticacion JWT"))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Pegá acá el token JWT (sin 'Bearer ').")));
    }

    @Bean
    public OperationCustomizer springdocPageableCustomizer() {
        return (operation, handlerMethod) -> {
            // Solo aplicar a endpoints que tengan un parametro Pageable
            boolean tienePageable = Arrays.stream(handlerMethod.getMethod().getParameters())
                    .anyMatch(p -> Pageable.class.isAssignableFrom(p.getType()));

            if (!tienePageable) {
                return operation; // Lo dejamos como esta
            }

            // SpringDoc 3.x a veces devuelve null en getParameters(), nos aseguramos
            if (operation.getParameters() == null) {
                operation.setParameters(new ArrayList<>());
            }

            // Quita el param "pageable" autogenerado (que aparece como objeto JSON)
            operation.getParameters().removeIf(p -> "pageable".equals(p.getName()));

            // Agrega los params individuales como query string
            operation.addParametersItem(new QueryParameter()
                    .name("page")
                    .description("Numero de pagina (0-indexed)")
                    .required(false));

            operation.addParametersItem(new QueryParameter()
                    .name("size")
                    .description("Cantidad de elementos por pagina")
                    .required(false));

            operation.addParametersItem(new QueryParameter()
                    .name("sort")
                    .description("Orden, formato: campo,direccion (ej: nombre,asc)")
                    .required(false));

            return operation;
        };
    }

    /**
     * Saca el requisito de seguridad de los endpoints públicos
     * para que Swagger no muestre el candado en ellos (login, etc).
     */
    @Bean
    public OperationCustomizer publicEndpointsSecurityCustomizer() {
        return (operation, handlerMethod) -> {
            String path = handlerMethod.getMethod().getDeclaringClass().getName()
                    + "#" + handlerMethod.getMethod().getName();

            // Marcamos como públicos:
            // - UsuariosController#login (POST /usuarios/login)
            if (path.endsWith("#login") && handlerMethod.getMethod().getParameterCount() > 0) {
                operation.setSecurity(new ArrayList<>()); // sin seguridad
            }

            return operation;
        };
    }
}
