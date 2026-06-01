package ejercicio4.business;

import com.jakewharton.fliptables.FlipTable;
import ejercicio4.data.DatabaseManager;
import ejercicio4.model.Producto;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ProductoService {
    private DatabaseManager db;

    public ProductoService(DatabaseManager db) {
        this.db = db;
    }

    public void registrarProducto(Producto producto) throws Exception {
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto no puede estar vacío.");
        }
        if (producto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio del producto debe ser mayor que 0.");
        }
        db.insertarProducto(producto);
    }

    public void mostrarProductos() throws Exception {
        ResultSet rs = db.obtenerProductos();
        String[] encabezados = {"ID", "Nombre", "Precio($)", "Stock"};
        List<String[]> filas = new ArrayList<>();
        boolean hayDatos = false;
        while (rs.next()) {
            hayDatos = true;
            filas.add(new String[]{
                String.valueOf(rs.getInt("id")),
                rs.getString("nombre"),
                String.format("%.2f", rs.getDouble("precio")),
                String.valueOf(rs.getInt("stock"))
            });
        }
        if (!hayDatos) {
            System.out.println("\nNo hay productos registrados.\n");
        } else {
            System.out.println("\n========== LISTA DE PRODUCTOS ==========");
            System.out.println(FlipTable.of(encabezados, filas.toArray(new String[][]{})));
        }
        rs.close();
    }

    public Producto buscarProductoPorId(int id) throws Exception {
        ResultSet rs = db.obtenerProductoPorId(id);
        Producto producto = null;
        if (rs.next()) {
            producto = new Producto(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getDouble("precio"),
                rs.getInt("stock")
            );
        }
        rs.close();
        return producto;
    }

    public void mostrarProductoPorId(int id) throws Exception {
        Producto producto = buscarProductoPorId(id);
        if (producto != null) {
            String[] encabezados = {"ID", "Nombre", "Precio", "Stock"};
            String[][] datos = {{
                String.valueOf(producto.getId()),
                producto.getNombre(),
                String.format("%.2f", producto.getPrecio()),
                String.valueOf(producto.getStock())
            }};
            System.out.println("\n========== PRODUCTO ENCONTRADO ==========");
            System.out.println(FlipTable.of(encabezados, datos));
        } else {
            System.out.println("No se encontró un producto con ese ID.");
        }
    }
}