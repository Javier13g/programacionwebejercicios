package ejercicio4.model;

public class DetallePedido {
    private int pedidoId;
    private int productoId;
    private int cantidad;

    public DetallePedido() {}

    public DetallePedido(int pedidoId, int productoId, int cantidad) {
        this.pedidoId = pedidoId;
        this.productoId = productoId;
        this.cantidad = cantidad;
    }

    public int getPedidoId() { return pedidoId; }
    public void setPedidoId(int pedidoId) { this.pedidoId = pedidoId; }
    public int getProductoId() { return productoId; }
    public void setProductoId(int productoId) { this.productoId = productoId; }
    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }
}