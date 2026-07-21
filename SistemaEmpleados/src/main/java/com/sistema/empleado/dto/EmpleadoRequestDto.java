package com.sistema.empleado.dto;

import java.time.LocalDate;

import com.sistema.empleado.models.EstadoEmpleado;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class EmpleadoRequestDto {

    @NotBlank(message = "La cédula es obligatoria")
    @Pattern(regexp = "[0-9]{6,15}", message = "La cédula debe tener entre 6 y 15 dígitos")
    private String cedula;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email válido")
    @Size(max = 150)
    private String email;

    @Pattern(regexp = "[+0-9()\\-\\s]{0,30}", message = "El teléfono tiene caracteres inválidos")
    private String telefono;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    @PastOrPresent(message = "La fecha de ingreso no puede ser futura")
    private LocalDate fechaIngreso;

    private EstadoEmpleado estado;

    @NotNull(message = "El departamento es obligatorio")
    @Positive(message = "El id del departamento debe ser positivo")
    private Long departamentoId;

    @NotNull(message = "El cargo es obligatorio")
    @Positive(message = "El id del cargo debe ser positivo")
    private Long cargoId;

    @Positive(message = "El id del jefe debe ser positivo")
    private Long jefeId;

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public LocalDate getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(LocalDate fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public EstadoEmpleado getEstado() {
        return estado;
    }

    public void setEstado(EstadoEmpleado estado) {
        this.estado = estado;
    }

    public Long getDepartamentoId() {
        return departamentoId;
    }

    public void setDepartamentoId(Long departamentoId) {
        this.departamentoId = departamentoId;
    }

    public Long getCargoId() {
        return cargoId;
    }

    public void setCargoId(Long cargoId) {
        this.cargoId = cargoId;
    }

    public Long getJefeId() {
        return jefeId;
    }

    public void setJefeId(Long jefeId) {
        this.jefeId = jefeId;
    }
}
