package ejercicio89.Classes;

import java.util.Date;

public class Mamiferos {
    private String Nombre;
    private String Raza;
    private Date FechaNacimiento;
    private Float Peso;

    public Mamiferos() {}

    public Mamiferos( String nombre, String raza, Date fechaNacimiento, Float peso) {
        this.Nombre = nombre;
        this.Raza = raza;
        this.FechaNacimiento = fechaNacimiento;
        this.Peso = peso;
    }

    public void Comer() {
    }

    public void Comunicarse() {
    }

    public String getNombre() {
        return Nombre;
    }

    public void setNombre(String nombre) {
        Nombre = nombre;
    }

    public String getRaza() {
        return Raza;
    }

    public void setRaza(String raza) {
        Raza = raza;
    }

    public Date getFechaNacimiento() {
        return FechaNacimiento;
    }

    public void setFechaNacimiento(Date fechaNacimiento) {
        FechaNacimiento = fechaNacimiento;
    }

    public Float getPeso() {
        return Peso;
    }

    public void setPeso(Float peso) {
        Peso = peso;
    }
}
