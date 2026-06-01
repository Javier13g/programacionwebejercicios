package ejercicio3;

import com.jakewharton.fliptables.FlipTable;
import ejercicio3.classes.Gato;
import ejercicio3.classes.Perro;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        while (true) {
            System.out.println("\n--- Menú de Registro de Animales ---");
            System.out.println("1. Registrar un Perro");
            System.out.println("2. Registrar un Gato");
            System.out.println("3. Salir");
            System.out.print("Ingrese una opción: ");
            
            String entrada = scanner.nextLine();
            int opcion;
            try {
                opcion = Integer.parseInt(entrada);
            } catch (NumberFormatException e) {
                System.out.println("Por favor, ingrese un número válido.");
                continue;
            }

            switch (opcion) {
                case 1:
                    System.out.println("\n--- Registro de Perro ---");
                    System.out.print("Nombre: ");
                    String nombre = LectorDatos.pedirString(scanner, 1, "Nombre");
                    System.out.print("Raza: ");
                    String raza = LectorDatos.pedirString(scanner, 1, "Raza");
                    System.out.print("Tipo animal: ");
                    String tipo = LectorDatos.pedirString(scanner, 1, "Tipo animal");
                    System.out.print("Fecha Nacimiento (dd/MM/yyyy): ");
                    String fecha = LectorDatos.pedirFechaString(scanner);
                    System.out.print("Peso: ");
                    float peso = LectorDatos.pedirFloat(scanner, "Peso");
                    System.out.print("Lugar de entrenamiento: ");
                    String lugarEntrenamiento = LectorDatos.pedirString(scanner, 1, "Lugar de entrenamiento");
                    
                    Perro perro = new Perro(nombre, raza, tipo, fecha, peso, lugarEntrenamiento);
                    
                    System.out.println("\nPerro creado exitosamente.");
                    System.out.println("----------- Datos del perro -----------");
                    String[] encabezadosPerro = {"Nombre", "Raza", "Tipo", "Fecha Nacimiento", "Peso(kg)", "Lugar entrenamiento"};
                    System.out.println(FlipTable.of(encabezadosPerro, new String[][]{
                        {perro.getNombre(), perro.getRaza(), perro.getTipoAnimal(), perro.getFechaNacimiento(), String.valueOf(perro.getPeso()), perro.getLugarEntrenamiento()}
                    }));
                    
                    System.out.println("--- Acciones del Perro ---");
                    perro.tipoAnimal();
                    perro.comer();
                    System.out.print("Comunicarse: ");
                    perro.comunicarse();
                    break;
                    
                case 2:
                    System.out.println("\n--- Registro de Gato ---");
                    System.out.print("Nombre: ");
                    nombre = LectorDatos.pedirString(scanner, 1, "Nombre");
                    System.out.print("Raza: ");
                    raza = LectorDatos.pedirString(scanner, 1, "Raza");
                    System.out.print("Tipo animal: ");
                    tipo = LectorDatos.pedirString(scanner, 1, "Tipo animal");
                    System.out.print("Fecha Nacimiento (dd/MM/yyyy): ");
                    fecha = LectorDatos.pedirFechaString(scanner);
                    System.out.print("Peso: ");
                    peso = LectorDatos.pedirFloat(scanner, "Peso");
                    System.out.print("Altura de salto: ");
                    double alturaSalto = LectorDatos.pedirDouble(scanner, "Altura de salto");
                    
                    Gato gato = new Gato(nombre, raza, tipo, fecha, peso, alturaSalto);
                    
                    System.out.println("\nGato creado exitosamente.");
                    System.out.println("----------- Datos del gato -----------");
                    String[] encabezadosGato = {"Nombre", "Raza", "Tipo", "Fecha Nacimiento", "Peso(kg)", "Altura salto"};
                    System.out.println(FlipTable.of(encabezadosGato, new String[][]{
                        {gato.getNombre(), gato.getRaza(), gato.getTipoAnimal(), gato.getFechaNacimiento(), String.valueOf(gato.getPeso()), String.valueOf(gato.getAlturaSalto())}
                    }));
                    
                    System.out.println("--- Acciones del Gato ---");
                    gato.tipoAnimal();
                    gato.comer();
                    System.out.print("Comunicarse: ");
                    gato.comunicarse();
                    break;
                    
                case 3:
                    System.out.println("Saliendo del programa...");
                    scanner.close();
                    return;
                    
                default:
                    System.out.println("Opción no válida. Intente nuevamente.");
            }
        }
    }
}