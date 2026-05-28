package ejercicio89.Classes;

import java.util.Date;

public class Mamiferos {
    private String nombre;
    private String raza;
    private Date fechaNacimiento;
    private Float peso;

    public Mamiferos() {}

    public Mamiferos( String nombre, String raza, Date fechaNacimiento, Float peso) {
        this.nombre = nombre;
        this.raza = raza;
        this.fechaNacimiento = fechaNacimiento;
        this.peso = peso;
    }

    public void Comer() {
    }

    public void Comunicarse() {
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRaza() {
        return raza;
    }

    public void setRaza(String raza) {
        this.raza = raza;
    }

    public Date getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(Date fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public Float getPeso() {
        return peso;
    }

    public void setPeso(Float peso) {
        this.peso = peso;
    }
}
