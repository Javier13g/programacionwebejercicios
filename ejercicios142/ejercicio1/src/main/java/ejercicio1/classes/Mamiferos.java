package ejercicio1.classes;

import ejercicio1.interfaces.IMamiferos;

public abstract class Mamiferos implements IMamiferos {
    
    private String nombre;
    private String raza;
    private String tipoAnimal;
    private String fechaNacimiento;
    private float peso;

    public Mamiferos(String nombre, String raza, String tipoAnimal, String fechaNacimiento, float peso) {
        this.nombre = nombre;
        this.raza = raza;
        this.tipoAnimal = tipoAnimal;
        this.fechaNacimiento = fechaNacimiento;
        this.peso = peso;
    }

    public void comer() {
        System.out.println(this.nombre + " está comiendo.");
    }

    public void tipoAnimal() {
        System.out.println("Este animal es de tipo: " + this.tipoAnimal);
    }

    public String getNombre() { return nombre; }
    public String getRaza() { return raza; }
    public String getTipoAnimal() { return tipoAnimal; }
    public String getFechaNacimiento() { return fechaNacimiento; }
    public float getPeso() { return peso; }

    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setRaza(String raza) { this.raza = raza; }
    public void setTipoAnimal(String tipoAnimal) { this.tipoAnimal = tipoAnimal; }
    public void setFechaNacimiento(String fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    public void setPeso(float peso) { this.peso = peso; }
}
