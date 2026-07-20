package com.sistema.empleado.models;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "empleados")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EmpleadosModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cedula", nullable = false, unique = true, length = 11)
    private String cedula;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "fechaIngreso", nullable = false)
    private LocalDate fechaIngreso;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoEmpleado estado = EstadoEmpleado.activo;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamentoId", nullable = false)
    private DepartamentosModel departamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cargoId", nullable = false)
    private CargosModel cargo;

    // Auto-referencia: el jefe también es un empleado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jefeId")
    private EmpleadosModel jefe;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public DepartamentosModel getDepartamento() {
        return departamento;
    }

    public void setDepartamento(DepartamentosModel departamento) {
        this.departamento = departamento;
    }

    public CargosModel getCargo() {
        return cargo;
    }

    public void setCargo(CargosModel cargo) {
        this.cargo = cargo;
    }

    public EmpleadosModel getJefe() {
        return jefe;
    }

    public void setJefe(EmpleadosModel jefe) {
        this.jefe = jefe;
    }

    public Long getDepartamentoId() {
        return departamento != null ? departamento.getId() : null;
    }

    public Long getJefeId() {
        return jefe != null ? jefe.getId() : null;
    }
}