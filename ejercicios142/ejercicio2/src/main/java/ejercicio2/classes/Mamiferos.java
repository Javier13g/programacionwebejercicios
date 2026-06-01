package ejercicio2.classes;

public abstract class Mamiferos {
    
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
        System.out.println("El tipo de animal es: " + this.tipoAnimal);
    }

    public abstract void comunicarse();

    public String getNombre() { return nombre; }
    public String getRaza() { return raza; }
    public String getTipoAnimal() { return tipoAnimal; }
    public String getFechaNacimiento() { return fechaNacimiento; }
    public float getPeso() { return peso; }
}
