package ejercicio2.classes;

public class Gato extends Mamiferos {

    private double alturaSalto;

    public Gato(String nombre, String raza, String tipoAnimal, String fechaNacimiento, float peso, double alturaSalto) {
        super(nombre, raza, tipoAnimal, fechaNacimiento, peso);
        this.alturaSalto = alturaSalto;
    }

    public double getAlturaSalto() {
        return alturaSalto;
    }

    @Override
    public void comunicarse() {
        System.out.println("miau miau");
    }
}
