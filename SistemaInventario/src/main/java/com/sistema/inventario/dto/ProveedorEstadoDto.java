package com.sistema.inventario.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO para cambiar el estado (habilitado / deshabilitado) de un proveedor.
 *  - deleted = true  -> deshabilita (soft delete)
 *  - deleted = false -> rehabilita
 */
public class ProveedorEstadoDto {

    @NotNull
    private Boolean deleted;

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }
}