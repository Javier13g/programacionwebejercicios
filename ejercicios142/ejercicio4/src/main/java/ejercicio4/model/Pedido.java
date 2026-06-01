package ejercicio4.model;

public class Pedido {
    private int id;
    private int clienteId;
    private String fechaPedido;
    private String estado;
    private double total;

    public Pedido() {}

    public Pedido(int id, int clienteId, String fechaPedido, String estado, double total) {
        this.id = id;
        this.clienteId = clienteId;
        this.fechaPedido = fechaPedido;
        this.estado = estado;
        this.total = total;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getClienteId() { return clienteId; }
    public void setClienteId(int clienteId) { this.clienteId = clienteId; }
    public String getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(String fechaPedido) { this.fechaPedido = fechaPedido; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    @Override
    public String toString() {
        return "Pedido{id=" + id + ", clienteId=" + clienteId + ", fechaPedido=" + fechaPedido + ", estado=" + estado + ", total=" + total + '}';
    }
}