package ejercicio4;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Scanner;

public class LectorDatos {

    public static String pedirFechaString(Scanner scanner) {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        sdf.setLenient(false);
        while (true) {
            String fecha = scanner.nextLine();
            try {
                sdf.parse(fecha);
                return fecha;
            } catch (ParseException e) {
                System.out.print("Formato inválido. Use dd/MM/yyyy: ");
            }
        }
    }

    public static Float pedirFloat(Scanner scanner, String campo) {
        while (true) {
            try {
                float valor = Float.parseFloat(scanner.nextLine());
                if (valor > 0) {
                    return valor;
                }
                System.out.print(campo + " debe ser mayor que 0: ");
            } catch (NumberFormatException e) {
                System.out.print("Número inválido. Intente de nuevo: ");
            }
        }
    }

    public static Double pedirDouble(Scanner scanner, String campo) {
        while (true) {
            try {
                double valor = Double.parseDouble(scanner.nextLine());
                if (valor >= 0) {
                    return valor;
                }
                System.out.print(campo + " no puede ser negativo: ");
            } catch (NumberFormatException e) {
                System.out.print("Número inválido. Intente de nuevo: ");
            }
        }
    }

    public static Integer pedirInt(Scanner scanner, String campo) {
        while (true) {
            try {
                return Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException e) {
                System.out.print("Número inválido. Intente de nuevo: ");
            }
        }
    }

    public static String pedirString(Scanner scanner, int minLength, String campo) {
        while (true) {
            String input = scanner.nextLine();
            if (input.length() >= minLength && !input.trim().isEmpty()) {
                return input;
            }
            System.out.print(campo + " no puede estar vacío: ");
        }
    }
}