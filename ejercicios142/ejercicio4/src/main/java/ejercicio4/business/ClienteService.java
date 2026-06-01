package ejercicio4.business;

import com.jakewharton.fliptables.FlipTable;
import ejercicio4.data.DatabaseManager;
import ejercicio4.model.Cliente;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ClienteService {
    private DatabaseManager db;

    public ClienteService(DatabaseManager db) {
        this.db = db;
    }

    public void registrarCliente(Cliente cliente) throws Exception {
        if (cliente.getNombre() == null || cliente.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del cliente no puede estar vacío.");
        }
        db.insertarCliente(cliente);
    }

    public void mostrarClientes() throws Exception {
        ResultSet rs = db.obtenerClientes();
        String[] encabezados = {"ID", "Nombre", "Teléfono", "Dirección"};
        List<String[]> filas = new ArrayList<>();
        boolean hayDatos = false;
        while (rs.next()) {
            hayDatos = true;
            filas.add(new String[]{
                String.valueOf(rs.getInt("id")),
                rs.getString("nombre"),
                rs.getString("telefono"),
                rs.getString("direccion")
            });
        }
        if (!hayDatos) {
            System.out.println("\nNo hay clientes registrados.\n");
        } else {
            System.out.println("\n========== LISTA DE CLIENTES ==========");
            System.out.println(FlipTable.of(encabezados, filas.toArray(new String[][]{})));
        }
        rs.close();
    }

    public Cliente buscarClientePorId(int id) throws Exception {
        ResultSet rs = db.obtenerClientePorId(id);
        Cliente cliente = null;
        if (rs.next()) {
            cliente = new Cliente(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("telefono"),
                rs.getString("direccion")
            );
        }
        rs.close();
        return cliente;
    }
}