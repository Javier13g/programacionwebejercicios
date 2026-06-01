package ejercicio1;

import com.jakewharton.fliptables.FlipTable;
import ejercicio1.classes.Gato;
import ejercicio1.classes.Perro;
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
                    String pNombre = LectorDatos.pedirString(scanner, 1, "Nombre");
                    System.out.print("Raza: ");
                    String pRaza = LectorDatos.pedirString(scanner, 1, "Raza");
                    System.out.print("Tipo animal: ");
                    String pTipo = LectorDatos.pedirString(scanner, 1, "Tipo animal");
                    System.out.print("Fecha Nacimiento (dd/MM/yyyy): ");
                    String pFecha = LectorDatos.pedirFechaString(scanner);
                    System.out.print("Peso: ");
                    float pPeso = LectorDatos.pedirFloat(scanner, "Peso");
                    System.out.print("Lugar de entrenamiento: ");
                    String lugarEntrenamiento = LectorDatos.pedirString(scanner, 1, "Lugar de entrenamiento");
                    
                    Perro perro = new Perro(pNombre, pRaza, pTipo, pFecha, pPeso, lugarEntrenamiento);
                    
                    System.out.println("\nPerro creado exitosamente.");
                    System.out.println("----------- Datos del perro -----------");
                    String[] encabezadosPerro = {"Nombre", "Raza", "Tipo", "Fecha Nacimiento", "Peso(kg)", "Lugar entrenamiento"};
                    System.out.println(FlipTable.of(encabezadosPerro, new String[][]{
                        {perro.getNombre(), perro.getRaza(), perro.getTipoAnimal(), perro.getFechaNacimiento(), String.valueOf(perro.getPeso()), perro.getLugarEntrenamiento()}
                    }));
                    
                    System.out.println("--- Acciones ---");
                    perro.tipoAnimal();
                    perro.comer();
                    System.out.print("El perro dice: ");
                    perro.comunicarse();
                    break;
                    
                case 2:
                    System.out.println("\n--- Registro de Gato ---");
                    System.out.print("Nombre: ");
                    String gNombre = LectorDatos.pedirString(scanner, 1, "Nombre");
                    System.out.print("Raza: ");
                    String gRaza = LectorDatos.pedirString(scanner, 1, "Raza");
                    System.out.print("Tipo animal: ");
                    String gTipo = LectorDatos.pedirString(scanner, 1, "Tipo animal");
                    System.out.print("Fecha Nacimiento (dd/MM/yyyy): ");
                    String gFecha = LectorDatos.pedirFechaString(scanner);
                    System.out.print("Peso: ");
                    float gPeso = LectorDatos.pedirFloat(scanner, "Peso");
                    System.out.print("Altura de salto: ");
                    double alturaSalto = LectorDatos.pedirDouble(scanner, "Altura de salto");
                    
                    Gato gato = new Gato(gNombre, gRaza, gTipo, gFecha, gPeso, alturaSalto);
                    
                    System.out.println("\nGato creado exitosamente.");
                    System.out.println("----------- Datos del gato -----------");
                    String[] encabezadosGato = {"Nombre", "Raza", "Tipo", "Fecha Nacimiento", "Peso(kg)", "Altura salto"};
                    System.out.println(FlipTable.of(encabezadosGato, new String[][]{
                        {gato.getNombre(), gato.getRaza(), gato.getTipoAnimal(), gato.getFechaNacimiento(), String.valueOf(gato.getPeso()), String.valueOf(gato.getAlturaSalto())}
                    }));
                    
                    System.out.println("--- Acciones ---");
                    gato.tipoAnimal();
                    gato.comer();
                    System.out.print("El gato dice: ");
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