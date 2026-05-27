package ejercicio89.Classes;

import java.util.Date;

public class Gato extends Mamiferos {
    private Double AlturaSalto;

    public Gato() {}

    public Gato(String nombre, String raza, Date fechaNacimiento, Float peso, Double alturaSalto) {
        super(nombre, raza, fechaNacimiento, peso);
        this.AlturaSalto = alturaSalto;
    }

    public Double getAlturaSalto() {
        return AlturaSalto;
    }

    public void setAlturaSalto(Double alturaSalto) {
        AlturaSalto = alturaSalto;
    }

    @Override
    public void Comer() {
        System.out.println("El gato esta comiendo");
    }
    @Override
    public void Comunicarse() {
        System.out.println("Miau Miau");
    }


}
