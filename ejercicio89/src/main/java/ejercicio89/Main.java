package ejercicio89;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Scanner;

import com.jakewharton.fliptables.FlipTable;

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
                        String nombrePerro = LectorDatos.pedirStringMinimo(scanner, 3, "Nombre");
                        System.out.println("Ingrese la raza del perro: ");
                        String razaPerro = LectorDatos.pedirStringMinimo(scanner, 3, "Raza");
                        System.out.println("Ingrese la fecha de nacimiento del perro (dd/MM/yyyy): ");
                        Date datePerro = LectorDatos.pedirFecha(scanner);

                        System.out.println("Ingrese el peso del perro: ");
                        Float pesoPerro = LectorDatos.pedirFloat(scanner, "Peso");
                        
                        System.out.println("Ingrese el lugar de entrenamiento del perro: ");
                        String lugarEntrenamientoPerro = LectorDatos.pedirStringMinimo(scanner, 3, "Lugar de entrenamiento");

                        Perro perro = new Perro(nombrePerro, razaPerro, datePerro, pesoPerro, lugarEntrenamientoPerro);
                        String[] EncabezadosPerro = {"Nombre", "Raza", "Fecha de nacimiento", "Peso(kg)", "Lugar de entrenamiento"};
                        System.out.println("\nPerro creado exitosamente.");
                        System.out.println("-----------Datos del perro-----------");
                        System.out.println(FlipTable.of(EncabezadosPerro, new String[][]{
                            {perro.getNombre(), perro.getRaza(), new SimpleDateFormat("dd/MM/yyyy").format(perro.getFechaNacimiento()), perro.getPeso().toString(), perro.getLugarEntrenamiento()}
                        }));
                        perro.Comer();
                        perro.Comunicarse();
                        break;
                    case 2:
                        System.out.println("Ingrese el nombre del gato: ");
                        String nombreGato = LectorDatos.pedirStringMinimo(scanner, 3, "Nombre");
                        System.out.println("Ingrese la raza del gato: ");
                        String razaGato = LectorDatos.pedirStringMinimo(scanner, 3, "Raza");
                        System.out.println("Ingrese la fecha de nacimiento del gato (dd/MM/yyyy): ");
                        Date dateGato = LectorDatos.pedirFecha(scanner);

                        System.out.println("Ingrese el peso del gato: ");
                        Float pesoGato = LectorDatos.pedirFloat(scanner, "Peso");

                        System.out.println("Ingrese la altura de salto del gato: ");
                        Double alturaSaltoGato = LectorDatos.pedirDouble(scanner, "Altura Salto");

                        Gato gato = new Gato(nombreGato, razaGato, dateGato, pesoGato, alturaSaltoGato);
                        System.out.println("\nGato creado exitosamente.");
                        System.out.println("-----------Datos del gato-----------");
                        String[] EncabezadosGato = {"Nombre", "Raza", "Fecha de nacimiento", "Peso(kg)", "Altura de salto(m)"};
                        System.out.println(FlipTable.of(EncabezadosGato, new String[][]{
                            {gato.getNombre(), gato.getRaza(), new SimpleDateFormat("dd/MM/yyyy").format(gato.getFechaNacimiento()), gato.getPeso().toString(), gato.getAlturaSalto().toString()}
                        }));
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