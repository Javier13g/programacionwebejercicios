package com.sistema.inventario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProveedorRequestDto {

    @NotBlank(message = "El nombre del proveedor es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    private String nombre;

    @Size(max = 30, message = "El telefono no puede superar los 30 caracteres")
    private String telefono;

    @Email(message = "El email debe tener un formato valido")
    @Size(max = 150)
    private String email;

    @Size(max = 255, message = "La direccion no puede superar los 255 caracteres")
    private String direccion;

    @Size(max = 150, message = "El contacto no puede superar los 150 caracteres")
    private String contacto;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getContacto() {
        return contacto;
    }

    public void setContacto(String contacto) {
        this.contacto = contacto;
    }
}