package com.sistema.empleado.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class DepartamentoRequestDto {

    @NotBlank(message = "El nombre del departamento es obligatorio")
    @Size(min = 2, max = 100)
    private String nombre;

    @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
    private String descripcion;

    @Positive(message = "El id del jefe debe ser positivo")
    private Long jefeId;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getJefeId() {
        return jefeId;
    }

    public void setJefeId(Long jefeId) {
        this.jefeId = jefeId;
    }
}
