package com.sistema.inventario.dto;

import jakarta.validation.constraints.NotNull;

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