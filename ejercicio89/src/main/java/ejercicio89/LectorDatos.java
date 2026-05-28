package ejercicio89;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Scanner;

public class LectorDatos {

    public static Date pedirFecha(Scanner scanner) {
        String fecha = scanner.nextLine();
        try {
            return new SimpleDateFormat("dd/MM/yyyy").parse(fecha);
        } catch (ParseException e) {
            System.out.println("Formato inválido. Se usará la fecha actual.");
            return new Date();
        }
    }

    public static Float pedirFloat(Scanner scanner, String campo) {
        while (true) {
            try {
                float valor = Float.parseFloat(scanner.nextLine());
                if (valor > 0) {
                    return valor;
                }
                System.out.println(campo + " debe ser mayor que 0. Intente de nuevo:");
            } catch (NumberFormatException e) {
                System.out.println("Por favor, ingrese un número decimal válido.");
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
                System.out.println(campo + " debe ser mayor que 0. Intente de nuevo:");
            } catch (NumberFormatException e) {
                System.out.println("Por favor, ingrese un número decimal válido.");
            }
        }
    }

    public static String pedirStringMinimo(Scanner scanner, int minLength, String campo) {
        while (true) {
            String input = scanner.nextLine();
            if (input.length() >= minLength) {
                return input;
            }
            System.out.println(campo + " debe tener al menos " + minLength + " caracteres. Intente de nuevo:");
        }
    }
}