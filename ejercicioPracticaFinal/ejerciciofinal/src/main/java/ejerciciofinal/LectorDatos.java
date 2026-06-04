package ejerciciofinal;

import java.util.Scanner;

public class LectorDatos {

    public static String pedirString(Scanner scanner, String campo) {
        while (true) {
            String input = scanner.nextLine().trim();
            if (!input.isEmpty()) {
                return input;
            }
            System.out.print(campo + " no puede estar vacío. Intente de nuevo: ");
        }
    }

    public static double pedirDouble(Scanner scanner, String campo) {
        while (true) {
            try {
                double valor = Double.parseDouble(scanner.nextLine().trim());
                return valor;
            } catch (NumberFormatException e) {
                System.out.print(campo + " debe ser un número válido: ");
            }
        }
    }

    public static int pedirInt(Scanner scanner, String campo) {
        while (true) {
            try {
                return Integer.parseInt(scanner.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.print(campo + " debe ser un número entero: ");
            }
        }
    }

    public static double pedirNota(Scanner scanner, String materia) {
        while (true) {
            try {
                double nota = Double.parseDouble(scanner.nextLine().trim());
                if (nota >= 0 && nota <= 100) {
                    return nota;
                }
                System.out.print("La nota de " + materia + " debe estar entre 0 y 100. Intente de nuevo: ");
            } catch (NumberFormatException e) {
                System.out.print(materia + " debe ser un número válido: ");
            }
        }
    }
}