package ejercicio89;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Scanner;

import ejercicio89.Classes.Gato;
import ejercicio89.Classes.Perro;

public class Main {
    public static void main(String[] args) {
        try (Scanner scanner = new Scanner(System.in)) {
            while (true){
                System.out.println("\nIngrese la opcion que desea realizar: ");
                System.out.println("1. Crear un perro");
                System.out.println("2. Crear un gato");
                System.out.println("3. Salir");
                
                int opcion = 0;
                try {
                    opcion = Integer.parseInt(scanner.nextLine());
                } catch (NumberFormatException e) {
                    System.out.println("Por favor, ingrese un número válido.");
                    continue;
                }

                switch (opcion) {
                    case 1:
                        System.out.println("Ingrese el nombre del perro: ");
                        String nombrePerro = scanner.nextLine();
                        System.out.println("Ingrese la raza del perro: ");
                        String razaPerro = scanner.nextLine();
                        System.out.println("Ingrese la fecha de nacimiento del perro (dd/MM/yyyy): ");
                        Date datePerro = LectorDatos.pedirFecha(scanner);

                        System.out.println("Ingrese el peso del perro: ");
                        Float pesoPerro = LectorDatos.pedirFloat(scanner);
                        
                        System.out.println("Ingrese el lugar de entrenamiento del perro: ");
                        String lugarEntrenamientoPerro = scanner.nextLine();

                        Perro perro = new Perro(nombrePerro, razaPerro, datePerro, pesoPerro, lugarEntrenamientoPerro);
                        System.out.println("\nPerro creado exitosamente.");
                        System.out.println("Datos del perro:");
                        System.out.println("Nombre: " + perro.getNombre());
                        System.out.println("Raza: " + perro.getRaza());
                        System.out.println("Fecha de nacimiento: " + new SimpleDateFormat("dd/MM/yyyy").format(perro.getFechaNacimiento()));
                        System.out.println("Peso: " + perro.getPeso());
                        System.out.println("Lugar de entrenamiento: " + perro.getLugarEntrenamiento());
                        perro.Comer();
                        perro.Comunicarse();
                        break;
                    case 2:
                        System.out.println("Ingrese el nombre del gato: ");
                        String nombreGato = scanner.nextLine();
                        System.out.println("Ingrese la raza del gato: ");
                        String razaGato = scanner.nextLine();
                        System.out.println("Ingrese la fecha de nacimiento del gato (dd/MM/yyyy): ");
                        Date dateGato = LectorDatos.pedirFecha(scanner);

                        System.out.println("Ingrese el peso del gato: ");
                        Float pesoGato = LectorDatos.pedirFloat(scanner);

                        System.out.println("Ingrese la altura de salto del gato: ");
                        Double alturaSaltoGato = LectorDatos.pedirDouble(scanner);

                        Gato gato = new Gato(nombreGato, razaGato, dateGato, pesoGato, alturaSaltoGato);
                        System.out.println("\nGato creado exitosamente.");
                        System.out.println("Datos del gato:");
                        System.out.println("Nombre: " + gato.getNombre());
                        System.out.println("Raza: " + gato.getRaza());
                        System.out.println("Fecha de nacimiento: " + new SimpleDateFormat("dd/MM/yyyy").format(gato.getFechaNacimiento()));
                        System.out.println("Peso: " + gato.getPeso());
                        System.out.println("Altura de salto: " + gato.getAlturaSalto());
                        gato.Comer();
                        gato.Comunicarse();
                        break;
                    case 3:
                        System.out.println("Saliendo...");
                        return;
                    default:
                        System.out.println("Opcion no valida");
                }
            }
        }
    }
}