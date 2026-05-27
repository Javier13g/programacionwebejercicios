package ejercicio89.Classes;

import java.util.Date;

public class Perro extends Mamiferos {
    private String lugarEntrenamiento;

    public Perro() {}

    public Perro(String nombre, String raza, Date fechaNacimiento, Float peso, String lugarEntrenamiento) {
        super(nombre, raza, fechaNacimiento, peso);
        this.lugarEntrenamiento = lugarEntrenamiento;
    }

    public String getLugarEntrenamiento() {
        return lugarEntrenamiento;
    }

    public void setLugarEntrenamiento(String lugarEntrenamiento) {
        this.lugarEntrenamiento = lugarEntrenamiento;
    }

    @Override
    public void Comer() {
        System.out.println("El perro esta comiendo");
    }
    @Override
    public void Comunicarse() {
        System.out.println("Guau Guau");
    }

}
