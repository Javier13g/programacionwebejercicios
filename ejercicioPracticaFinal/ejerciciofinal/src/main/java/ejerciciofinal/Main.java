package ejerciciofinal;

import com.jakewharton.fliptables.FlipTable;
import ejerciciofinal.business.CalificacionService;
import ejerciciofinal.data.FileDataManager;
import ejerciciofinal.model.Estudiante;
import ejerciciofinal.model.Reporte;
import java.util.List;
import java.util.Scanner;

public class Main {
    static Scanner scanner = new Scanner(System.in);
    static FileDataManager fileManager = new FileDataManager();
    static CalificacionService calificacionService = new CalificacionService(fileManager);

    public static void main(String[] args) {
        System.out.println("\n====================================");
        System.out.println("   COLEGIO DIOS ES BUENO");
        System.out.println("   SISTEMA DE CALIFICACIONES");
        System.out.println("====================================");

        while (true) {
            System.out.println("\n====================================");
            System.out.println("1- Registro de calificaciones");
            System.out.println("2- Reporte calificaciones por mes");
            System.out.println("3- Presione <ESC> para salir");
            System.out.println("====================================");
            System.out.print("Elija la opción deseada y pulse <ENTER>: ");

            String entrada = scanner.nextLine();

            if (entrada.equals("\u001b")) {
                System.out.println("\n¡Gracias por usar el sistema. Hasta luego!");
                break;
            }

            if (entrada.equals("3")) {
                System.out.println("\n¡Gracias por usar el sistema. Hasta luego!");
                break;
            }

            if (entrada.equals("1")) {
                registrarCalificaciones();
            } else if (entrada.equals("2")) {
                reportePorMes();
            } else {
                System.out.println("\nOpción no válida. Intente de nuevo.");
            }
        }
        scanner.close();
    }

    static void registrarCalificaciones() {
        System.out.println("\n--- Registro de Calificaciones ---");
        System.out.print("Nombre: ");
        String nombre = LectorDatos.pedirString(scanner, "Nombre");
        System.out.print("Apellido: ");
        String apellido = LectorDatos.pedirString(scanner, "Apellido");
        System.out.print("Curso: ");
        String curso = LectorDatos.pedirString(scanner, "Curso");
        System.out.print("Mes (Enero/Febrero/etc): ");
        String mes = LectorDatos.pedirString(scanner, "Mes");

        System.out.println("\n--- Ingrese las calificaciones ---");
        System.out.print("Matemática: ");
        double mat = LectorDatos.pedirNota(scanner, "Matemática");
        System.out.print("Lengua: ");
        double len = LectorDatos.pedirNota(scanner, "Lengua");
        System.out.print("Naturales: ");
        double nat = LectorDatos.pedirNota(scanner, "Naturales");
        System.out.print("Sociales: ");
        double soc = LectorDatos.pedirNota(scanner, "Sociales");

        Estudiante estudiante = new Estudiante(nombre, apellido, curso, mes, mat, len, nat, soc);

        try {
            calificacionService.registrarCalificacion(estudiante);
            System.out.println("\n¡Calificación registrada exitosamente!");
        } catch (Exception e) {
            System.out.println("\nError al guardar: " + e.getMessage());
        }
    }

    static void reportePorMes() {
        System.out.println("\n--- Reporte por Mes ---");
        System.out.print("Ingrese el mes (Enero/Febrero/etc): ");
        String mesBuscado = LectorDatos.pedirString(scanner, "Mes");

        try {
            List<Reporte> reportes = calificacionService.generarReportePorMes(mesBuscado);

            if (reportes == null) {
                System.out.println("\nNo hay calificaciones para el mes de " + mesBuscado);
                return;
            }

            for (Reporte reporte : reportes) {
                System.out.println("\n" + reporte.getEncabezado());
                System.out.println(FlipTable.of(reporte.getEncabezadosTabla(), reporte.getFilasTabla()));
                System.out.println(reporte.getPie());
            }

        } catch (Exception e) {
            System.out.println("Error al generar reporte: " + e.getMessage());
        }
    }
}