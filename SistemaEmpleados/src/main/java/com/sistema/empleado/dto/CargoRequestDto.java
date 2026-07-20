package com.sistema.empleado.dto;

import com.sistema.empleado.models.NivelCargo;

public class CargoRequestDto {

    private String nombre;
    private NivelCargo nivel;
    private Double salarioBase;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public NivelCargo getNivel() {
        return nivel;
    }

    public void setNivel(NivelCargo nivel) {
        this.nivel = nivel;
    }

    public Double getSalarioBase() {
        return salarioBase;
    }

    public void setSalarioBase(Double salarioBase) {
        this.salarioBase = salarioBase;
    }
}
