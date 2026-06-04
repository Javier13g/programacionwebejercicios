package ejerciciofinal.data;

import ejerciciofinal.model.Estudiante;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class FileDataManager {
    private static final String BASE_PATH = "./ejercicioPracticaFinal/ejerciciofinal/data/";
    private static final String FILENAME = "calificaciones.txt";

    public FileDataManager() {
        new File(BASE_PATH).mkdirs();
    }

    private String getFilePath() {
        return BASE_PATH + FILENAME;
    }

    public void guardarEstudiante(Estudiante estudiante) throws IOException {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(getFilePath(), true))) {
            bw.write(estudiante.getLineaArchivo());
            bw.newLine();
        }
    }

    public List<Estudiante> obtenerTodos() throws IOException {
        List<Estudiante> estudiantes = new ArrayList<>();
        File file = new File(getFilePath());
        if (!file.exists()) return estudiantes;

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                if (!linea.trim().isEmpty()) {
                    Estudiante e = Estudiante.fromLineaArchivo(linea);
                    if (e != null) {
                        estudiantes.add(e);
                    }
                }
            }
        }
        return estudiantes;
    }

    public List<Estudiante> obtenerPorMes(String mes) throws IOException {
        List<Estudiante> filtrados = new ArrayList<>();
        List<Estudiante> todos = obtenerTodos();
        for (Estudiante e : todos) {
            if (e.getMes().equalsIgnoreCase(mes)) {
                filtrados.add(e);
            }
        }
        return filtrados;
    }

    public int contarEstudiantes() throws IOException {
        return obtenerTodos().size();
    }
}