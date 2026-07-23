package com.sistema.inventario.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO para cambiar el estado (habilitado / deshabilitado) de un producto.
 *  - deleted = true  -> deshabilita (soft delete)
 *  - deleted = false -> rehabilita
 */
public class ProductoEstadoDto {

    @NotNull
    private Boolean deleted;

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }
}