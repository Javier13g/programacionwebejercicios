package ejercicio4.business;

import com.jakewharton.fliptables.FlipTable;
import ejercicio4.data.DatabaseManager;
import ejercicio4.model.Pedido;
import ejercicio4.model.DetallePedido;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PedidoService {
    private DatabaseManager db;

    public PedidoService(DatabaseManager db) {
        this.db = db;
    }

    public int registrarPedido(Pedido pedido, List<DetallePedido> detalles) throws SQLException {
        if (pedido.getClienteId() <= 0) {
            throw new IllegalArgumentException("Debe seleccionar un cliente válido.");
        }
        if (detalles == null || detalles.isEmpty()) {
            throw new IllegalArgumentException("Debe incluir al menos un producto en el pedido.");
        }

        // Esto valida que cada producto exista y que haya stock suficiente antes de insertar el pedido
        for (DetallePedido detalle : detalles) {
            try (ResultSet rs = db.obtenerProductoPorId(detalle.getProductoId())) {
                if (rs.next()) {
                    int stockActual = rs.getInt("stock");
                    if (stockActual < detalle.getCantidad()) {
                        throw new IllegalArgumentException(
                            "Stock insuficiente para producto ID " + detalle.getProductoId() +
                            ". Stock actual: " + stockActual + ", solicitado: " + detalle.getCantidad());
                    }
                } else {
                    throw new IllegalArgumentException("Producto ID " + detalle.getProductoId() + " no existe.");
                }
            }
        }

        // Esto calcula el total del pedido antes de insertarlo
        double total = 0;
        for (DetallePedido detalle : detalles) {
            try (ResultSet rs = db.obtenerProductoPorId(detalle.getProductoId())) {
                if (rs.next()) {
                    total += rs.getDouble("precio") * detalle.getCantidad();
                }
            }
        }
        pedido.setTotal(total);

        db.insertarPedido(pedido);

        int pedidoId = db.obtenerUltimoPedidoId();

        // Esto inserta los detalles del pedido y reduce el stock
        for (DetallePedido detalle : detalles) {
            detalle.setPedidoId(pedidoId);
            db.insertarDetallePedido(detalle);
            db.reducirStock(detalle.getProductoId(), detalle.getCantidad());
        }

        return pedidoId;
    }

    public void mostrarPedidos() throws SQLException {
        try (ResultSet rs = db.obtenerPedidos()) {
            String[] encabezados = {"ID", "Cliente", "Fecha", "Estado", "Total($)"};
            List<String[]> filas = new ArrayList<>();
            List<Integer> pedidoIds = new ArrayList<>();
            boolean hayDatos = false;
            while (rs.next()) {
                hayDatos = true;
                pedidoIds.add(rs.getInt("id"));
                filas.add(new String[]{
                    String.valueOf(rs.getInt("id")),
                    rs.getString("cliente_nombre"),
                    rs.getString("fecha_pedido"),
                    rs.getString("estado"),
                    String.format("%.2f", rs.getDouble("total"))
                });
            }
            if (!hayDatos) {
                System.out.println("\nNo hay pedidos registrados.\n");
                return;
            }
            System.out.println("\n========== LISTA DE PEDIDOS ==========");
            System.out.println(FlipTable.of(encabezados, filas.toArray(new String[][]{})));
        }

        try (ResultSet rs = db.obtenerPedidos()) {
            while (rs.next()) {
                int pedidoId = rs.getInt("id");
                try (ResultSet rsDet = db.obtenerDetallePedido(pedidoId)) {
                    String[] encDetalle = {"ID", "Producto", "Cant.", "Subtotal"};
                    List<String[]> filasDetalle = new ArrayList<>();
                    while (rsDet.next()) {
                        double subtotal = rsDet.getDouble("precio") * rsDet.getInt("cantidad");
                        filasDetalle.add(new String[]{
                            String.valueOf(rsDet.getInt("producto_id")),
                            rsDet.getString("producto_nombre"),
                            String.valueOf(rsDet.getInt("cantidad")),
                            String.format("%.2f", subtotal)
                        });
                    }
                    System.out.println("\n--- Detalles del Pedido #" + pedidoId + " ---");
                    if (!filasDetalle.isEmpty()) {
                        System.out.println(FlipTable.of(encDetalle, filasDetalle.toArray(new String[][]{})));
                    }
                }
            }
        }
    }
}