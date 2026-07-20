package com.sistema.empleado.dto;

public class DepartamentoRequestDto {

    private String nombre;
    private String descripcion;
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
