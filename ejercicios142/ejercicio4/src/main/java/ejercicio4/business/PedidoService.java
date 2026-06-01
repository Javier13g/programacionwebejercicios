package ejercicio4.business;

import com.jakewharton.fliptables.FlipTable;
import ejercicio4.data.DatabaseManager;
import ejercicio4.model.Pedido;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PedidoService {
    private DatabaseManager db;

    public PedidoService(DatabaseManager db) {
        this.db = db;
    }

    public void registrarPedido(Pedido pedido) throws SQLException {
        if (pedido.getClienteId() <= 0) {
            throw new IllegalArgumentException("Debe seleccionar un cliente válido.");
        }
        if (pedido.getTotal() < 0) {
            throw new IllegalArgumentException("El total del pedido no puede ser negativo.");
        }
        db.insertarPedido(pedido);
    }

    public void mostrarPedidos() throws SQLException {
        try (ResultSet rs = db.obtenerPedidos()) {
            String[] encabezados = {"ID", "Cliente", "Fecha", "Estado", "Total($)"};
            List<String[]> filas = new ArrayList<>();
            boolean hayDatos = false;
            while (rs.next()) {
                hayDatos = true;
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
            } else {
                System.out.println("\n========== LISTA DE PEDIDOS ==========");
                System.out.println(FlipTable.of(encabezados, filas.toArray(new String[][]{})));
            }
        }
    }
}