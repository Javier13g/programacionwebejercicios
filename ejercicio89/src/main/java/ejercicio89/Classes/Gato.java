package ejercicio89.Classes;

import java.util.Date;

public class Gato extends Mamiferos {
    private Double alturaSalto;

    public Gato() {}

    public Gato(String nombre, String raza, Date fechaNacimiento, Float peso, Double alturaSalto) {
        super(nombre, raza, fechaNacimiento, peso);
        this.alturaSalto = alturaSalto;
    }

    public Double getAlturaSalto() {
        return alturaSalto;
    }

    public void setAlturaSalto(Double alturaSalto) {
        this.alturaSalto = alturaSalto;
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
