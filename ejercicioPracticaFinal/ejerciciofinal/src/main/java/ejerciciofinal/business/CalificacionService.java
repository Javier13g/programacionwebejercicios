package ejerciciofinal.business;

import ejerciciofinal.data.FileDataManager;
import ejerciciofinal.model.Estudiante;
import ejerciciofinal.model.Reporte;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CalificacionService {
    private FileDataManager fileManager;

    public CalificacionService(FileDataManager fileManager) {
        this.fileManager = fileManager;
    }

    public void registrarCalificacion(Estudiante estudiante) throws IOException {
        if (estudiante.getNombreCompleto() == null || estudiante.getNombreCompleto().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del estudiante no puede estar vacío.");
        }
        fileManager.guardarEstudiante(estudiante);
    }

    public List<Reporte> generarReportePorMes(String mes) throws IOException {
        List<Estudiante> estudiantes = fileManager.obtenerPorMes(mes);
        
        if (estudiantes.isEmpty()) {
            return null;
        }

        List<String> cursos = new ArrayList<>();
        for (Estudiante e : estudiantes) {
            if (!cursos.contains(e.getCurso())) {
                cursos.add(e.getCurso());
            }
        }

        List<Reporte> reportes = new ArrayList<>();
        for (String curso : cursos) {
            List<Estudiante> cursoEstudiantes = new ArrayList<>();
            for (Estudiante e : estudiantes) {
                if (e.getCurso().equals(curso)) {
                    cursoEstudiantes.add(e);
                }
            }
            Collections.sort(cursoEstudiantes, (e1, e2) -> 
                e1.getNombreCompleto().compareToIgnoreCase(e2.getNombreCompleto()));
            
            reportes.add(new Reporte(mes, curso, cursoEstudiantes));
        }

        return reportes;
    }

    public List<Estudiante> obtenerTodosLosEstudiantes() throws IOException {
        return fileManager.obtenerTodos();
    }

    public int contarEstudiantes() throws IOException {
        return fileManager.contarEstudiantes();
    }
}