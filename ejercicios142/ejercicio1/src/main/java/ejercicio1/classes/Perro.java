package ejercicio1.classes;

public class Perro extends Mamiferos {
    
    private String lugarEntrenamiento;

    public Perro(String nombre, String raza, String tipoAnimal, String fechaNacimiento, float peso, String lugarEntrenamiento) {
        super(nombre, raza, tipoAnimal, fechaNacimiento, peso);
        this.lugarEntrenamiento = lugarEntrenamiento;
    }

    public String getLugarEntrenamiento() {
        return lugarEntrenamiento;
    }

    public void setLugarEntrenamiento(String lugarEntrenamiento) {
        this.lugarEntrenamiento = lugarEntrenamiento;
    }

    @Override
    public void comunicarse() {
        System.out.println("guau guau");
    }
}
