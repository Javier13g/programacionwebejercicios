package com.sistema.inventario.config;

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

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .addServersItem(new Server().url("/").description("Ruta Relativa del Contenedor"))
                .info(new Info()
                        .title("Sistema de Inventario API")
                        .version("1.0")
                        .description("API REST del sistema de inventario con autenticacion JWT"))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Pega aca el token JWT (sin 'Bearer ').")));
    }

    @Bean
    public OperationCustomizer springdocPageableCustomizer() {
        return (operation, handlerMethod) -> {
            boolean tienePageable = Arrays.stream(handlerMethod.getMethod().getParameters())
                    .anyMatch(p -> Pageable.class.isAssignableFrom(p.getType()));

            if (!tienePageable) {
                return operation;
            }

            if (operation.getParameters() == null) {
                operation.setParameters(new ArrayList<>());
            }

            operation.getParameters().removeIf(p -> "pageable".equals(p.getName()));

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

    @Bean
    public OperationCustomizer publicEndpointsSecurityCustomizer() {
        return (operation, handlerMethod) -> {
            String path = handlerMethod.getMethod().getDeclaringClass().getName()
                    + "#" + handlerMethod.getMethod().getName();

            if (path.endsWith("#login") && handlerMethod.getMethod().getParameterCount() > 0) {
                operation.setSecurity(new ArrayList<>()); // sin seguridad
            }

            return operation;
        };
    }
}