package com.sistema.empleado.config;

import java.util.ArrayList;
import java.util.Arrays;

import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Pageable;

import io.swagger.v3.oas.models.parameters.QueryParameter;

@Configuration
public class SpringDocConfig {

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
}
