package ejerciciofinal.model;

import java.util.List;

public class Reporte {
    private String mes;
    private String curso;
    private List<Estudiante> estudiantes;

    public Reporte(String mes, String curso, List<Estudiante> estudiantes) {
        this.mes = mes;
        this.curso = curso;
        this.estudiantes = estudiantes;
    }

    public String getEncabezado() {
        return "==============================================\n" +
               "Colegio Dios es bueno.\n" +
               "Reporte de Calificaciones de " + capitalize(mes) + "\n" +
               "Curso: " + curso + "\n" +
               "==============================================\n";
    }

    public String getPie() {
        return "--------------------------------------------------------------------------\n" +
               "Total de estudiantes: " + estudiantes.size();
    }

    public String[][] getFilasTabla() {
        String[][] filas = new String[estudiantes.size()][7];
        for (int i = 0; i < estudiantes.size(); i++) {
            Estudiante e = estudiantes.get(i);
            double prom = e.calcularPromedio();
            String promStr = prom > 0 ? String.format("%.2f", prom) : "N/A";
            String lit = prom > 0 ? String.valueOf(e.calcularLiteral()) : "N/A";
            filas[i] = new String[]{
                e.getNombreCompleto(),
                String.valueOf((int) Math.round(e.getMatematica())),
                String.valueOf((int) Math.round(e.getLengua())),
                String.valueOf((int) Math.round(e.getNaturales())),
                String.valueOf((int) Math.round(e.getSociales())),
                promStr,
                lit
            };
        }
        return filas;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    public String[] getEncabezadosTabla() {
        return new String[]{"Nombre Completo", "Mat", "Len", "Nat", "Soc", "Promedio", "Literal"};
    }
}