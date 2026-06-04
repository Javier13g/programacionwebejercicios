package ejerciciofinal.model;

import java.util.ArrayList;
import java.util.List;

public class Estudiante {
    private String nombre;
    private String apellido;
    private String curso;
    private String mes;
    private List<Calificacion> calificaciones;
    private double promedio;
    private char literal;

    public Estudiante() {
        this.calificaciones = new ArrayList<>();
    }

    public Estudiante(String nombre, String apellido, String curso, String mes,
                      double matematica, double lengua, double naturales, double sociales) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.curso = curso;
        this.mes = mes;
        this.calificaciones = new ArrayList<>();
        this.calificaciones.add(new Calificacion("Matemática", matematica));
        this.calificaciones.add(new Calificacion("Lengua", lengua));
        this.calificaciones.add(new Calificacion("Naturales", naturales));
        this.calificaciones.add(new Calificacion("Sociales", sociales));
        this.promedio = calcularPromedio();
        this.literal = calcularLiteral();
    }

    public double calcularPromedio() {
        if (calificaciones.isEmpty()) return 0;
        double suma = 0;
        for (Calificacion c : calificaciones) {
            suma += c.getValor();
        }
        return suma / calificaciones.size();
    }

    public char calcularLiteral() {
        double prom = calcularPromedio();
        if (prom > 90 && prom <= 100) return 'A';
        if (prom > 80 && prom <= 90) return 'B';
        if (prom > 70 && prom <= 80) return 'C';
        return 'F';
    }

    public Calificacion getCalificacionPorMateria(String materia) {
        for (Calificacion c : calificaciones) {
            if (c.getMateria().equalsIgnoreCase(materia)) {
                return c;
            }
        }
        return null;
    }

    public double getMatematica() {
        Calificacion c = getCalificacionPorMateria("Matemática");
        return c != null ? c.getValor() : 0;
    }

    public double getLengua() {
        Calificacion c = getCalificacionPorMateria("Lengua");
        return c != null ? c.getValor() : 0;
    }

    public double getNaturales() {
        Calificacion c = getCalificacionPorMateria("Naturales");
        return c != null ? c.getValor() : 0;
    }

    public double getSociales() {
        Calificacion c = getCalificacionPorMateria("Sociales");
        return c != null ? c.getValor() : 0;
    }

    public String getLineaArchivo() {
        double mat = getMatematica();
        double len = getLengua();
        double nat = getNaturales();
        double soc = getSociales();
        return nombre + "|" + apellido + "|" + curso + "|" + mes + "|" +
               mat + "|" + len + "|" + nat + "|" + soc;
    }

    public static Estudiante fromLineaArchivo(String linea) {
        String[] partes = linea.split("\\|");
        if (partes.length < 8) return null;
        return new Estudiante(
            partes[0], partes[1], partes[2], partes[3],
            Double.parseDouble(partes[4]),
            Double.parseDouble(partes[5]),
            Double.parseDouble(partes[6]),
            Double.parseDouble(partes[7])
        );
    }

    public String[] toFilaTabla() {
        double prom = calcularPromedio();
        String promStr = prom > 0 ? String.format("%.2f", prom) : "N/A";
        String lit = prom > 0 ? String.valueOf(calcularLiteral()) : "N/A";
        return new String[]{
            nombre, apellido,
            String.valueOf((int) Math.round(getMatematica())),
            String.valueOf((int) Math.round(getLengua())),
            String.valueOf((int) Math.round(getNaturales())),
            String.valueOf((int) Math.round(getSociales())),
            promStr,
            lit
        };
    }

    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }

    public String getNombre() { return nombre; }
    public String getApellido() { return apellido; }
    public double getPromedio() { return promedio; }
    public String getMes() { return mes; }
    public String getCurso() { return curso; }
    public char getLiteral() { return literal; }

    public void setLiteral(char literal) { this.literal = literal; }
    public void setPromedio(double promedio) { this.promedio = promedio; }
}