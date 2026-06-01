package ejercicio3;

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
                System.out.print("Formato inválido. Por favor, ingrese la fecha en formato dd/MM/yyyy: ");
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
                System.out.print(campo + " debe ser mayor que 0. Intente de nuevo: ");
            } catch (NumberFormatException e) {
                System.out.print("Por favor, ingrese un número decimal válido. Intente de nuevo: ");
            }
        }
    }

    public static Double pedirDouble(Scanner scanner, String campo) {
        while (true) {
            try {
                double valor = Double.parseDouble(scanner.nextLine());
                if (valor > 0) {
                    return valor;
                }
                System.out.print(campo + " debe ser mayor que 0. Intente de nuevo: ");
            } catch (NumberFormatException e) {
                System.out.print("Por favor, ingrese un número decimal válido. Intente de nuevo: ");
            }
        }
    }

    public static String pedirString(Scanner scanner, int minLength, String campo) {
        while (true) {
            String input = scanner.nextLine();
            if (input.length() >= minLength && !input.trim().isEmpty()) {
                return input;
            }
            System.out.print(campo + " debe tener al menos " + minLength + " caracteres. Intente de nuevo: ");
        }
    }
}
