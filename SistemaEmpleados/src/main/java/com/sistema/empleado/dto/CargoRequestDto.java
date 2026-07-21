package com.sistema.empleado.dto;

import com.sistema.empleado.models.NivelCargo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class CargoRequestDto {

    @NotBlank(message = "El nombre del cargo es obligatorio")
    @Size(min = 2, max = 100)
    private String nombre;

    @NotNull(message = "El nivel del cargo es obligatorio")
    private NivelCargo nivel;

    @NotNull(message = "El salario base es obligatorio")
    @Positive(message = "El salario base debe ser mayor a 0")
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
