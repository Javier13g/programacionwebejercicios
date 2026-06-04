package ejerciciofinal.model;

public class Calificacion {
    private String materia;
    private double valor;

    public Calificacion() {}

    public Calificacion(String materia, double valor) {
        this.materia = materia;
        this.valor = valor;
    }

    public String getMateria() { return materia; }
    public void setMateria(String materia) { this.materia = materia; }
    public double getValor() { return valor; }
    public void setValor(double valor) { this.valor = valor; }

    public String getMateriaAbreviada() {
        switch (materia.toLowerCase()) {
            case "matemática": case "matematicas": return "Mat";
            case "lengua": return "Len";
            case "naturales": return "Nat";
            case "sociales": return "Soc";
            default: return materia.substring(0, Math.min(3, materia.length())).toUpperCase();
        }
    }
}