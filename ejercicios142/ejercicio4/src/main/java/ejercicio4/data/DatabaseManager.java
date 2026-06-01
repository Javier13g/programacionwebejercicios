package ejercicio4.data;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import ejercicio4.model.Cliente;
import ejercicio4.model.Producto;
import ejercicio4.model.Pedido;

public class DatabaseManager {
    private static final String DATABASE_URL = "jdbc:sqlite:./ejercicios142/ejercicio4/tienda_pedidos.db";
    private Connection connection;

    public DatabaseManager() {
        try {
            connection = DriverManager.getConnection(DATABASE_URL);
            createTablesIfNotExist();
            insertInitialDataIfEmpty();
        } catch (SQLException e) {
            throw new RuntimeException("Error al conectar con la base de datos", e);
        }
    }

    private void createTablesIfNotExist() throws SQLException {
        try (Statement stmt = connection.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS Cliente (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    telefono TEXT,
                    direccion TEXT
                )
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS Producto (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    precio REAL NOT NULL,
                    stock INTEGER NOT NULL
                )
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS Pedido (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cliente_id INTEGER NOT NULL,
                    fecha_pedido TEXT NOT NULL,
                    estado TEXT NOT NULL,
                    total REAL NOT NULL,
                    FOREIGN KEY (cliente_id) REFERENCES Cliente(id)
                )
            """);
        }
    }

    private void insertInitialDataIfEmpty() throws SQLException {
        if (!hasData("Cliente")) {
            insertClient(new Cliente(0, "Juan Pérez", "555-1234", "Calle Principal #123"));
            insertClient(new Cliente(0, "María López", "555-5678", "Avenida Central #456"));
        }

        if (!hasData("Producto")) {
            insertProduct(new Producto(0, "Laptop HP", 15000.00, 10));
            insertProduct(new Producto(0, "Mouse Inalámbrico", 250.50, 50));
            insertProduct(new Producto(0, "Teclado Mecánico", 1200.00, 25));
        }

        if (!hasData("Pedido")) {
            String sql = "INSERT INTO Pedido (cliente_id, fecha_pedido, estado, total) VALUES (?, ?, ?, ?)";
            try (PreparedStatement ps = connection.prepareStatement(sql)) {
                ps.setInt(1, 1);
                ps.setString(2, "01/06/2026");
                ps.setString(3, "Entregado");
                ps.setDouble(4, 15250.50);
                ps.executeUpdate();

                ps.setInt(1, 2);
                ps.setString(2, "02/06/2026");
                ps.setString(3, "Pendiente");
                ps.setDouble(4, 1200.00);
                ps.executeUpdate();
            }
        }
    }

    private boolean hasData(String tableName) throws SQLException {
        String query = "SELECT COUNT(*) as total FROM " + tableName;
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            return rs.next() && rs.getInt("total") > 0;
        }
    }

    private void insertClient(Cliente cliente) throws SQLException {
        validateCliente(cliente);
        String sql = "INSERT INTO Cliente (nombre, telefono, direccion) VALUES (?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, cliente.getNombre());
            ps.setString(2, cliente.getTelefono());
            ps.setString(3, cliente.getDireccion());
            ps.executeUpdate();
        }
    }

    private void validateCliente(Cliente cliente) {
        if (cliente.getNombre() == null || cliente.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del cliente no puede estar vacío.");
        }
    }

    private void insertProduct(Producto producto) throws SQLException {
        validateProducto(producto);
        String sql = "INSERT INTO Producto (nombre, precio, stock) VALUES (?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, producto.getNombre());
            ps.setDouble(2, producto.getPrecio());
            ps.setInt(3, producto.getStock());
            ps.executeUpdate();
        }
    }

    private void validateProducto(Producto producto) {
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto no puede estar vacío.");
        }
        if (producto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio del producto debe ser mayor que 0.");
        }
        if (producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo.");
        }
    }

    public void insertarCliente(Cliente cliente) throws SQLException {
        validateCliente(cliente);
        String sql = "INSERT INTO Cliente (nombre, telefono, direccion) VALUES (?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, cliente.getNombre());
            ps.setString(2, cliente.getTelefono());
            ps.setString(3, cliente.getDireccion());
            ps.executeUpdate();
        }
    }

    public ResultSet obtenerClientes() throws SQLException {
        Statement stmt = connection.createStatement();
        return stmt.executeQuery("SELECT * FROM Cliente ORDER BY id DESC");
    }

    public ResultSet obtenerClientePorId(int id) throws SQLException {
        PreparedStatement ps = connection.prepareStatement("SELECT * FROM Cliente WHERE id = ?");
        ps.setInt(1, id);
        return ps.executeQuery();
    }

    public void insertarProducto(Producto producto) throws SQLException {
        validateProducto(producto);
        String sql = "INSERT INTO Producto (nombre, precio, stock) VALUES (?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, producto.getNombre());
            ps.setDouble(2, producto.getPrecio());
            ps.setInt(3, producto.getStock());
            ps.executeUpdate();
        }
    }

    public ResultSet obtenerProductos() throws SQLException {
        Statement stmt = connection.createStatement();
        return stmt.executeQuery("SELECT * FROM Producto ORDER BY id DESC");
    }

    public ResultSet obtenerProductoPorId(int id) throws SQLException {
        PreparedStatement ps = connection.prepareStatement("SELECT * FROM Producto WHERE id = ?");
        ps.setInt(1, id);
        return ps.executeQuery();
    }

    public void insertarPedido(Pedido pedido) throws SQLException {
        validatePedido(pedido);
        String sql = "INSERT INTO Pedido (cliente_id, fecha_pedido, estado, total) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, pedido.getClienteId());
            ps.setString(2, pedido.getFechaPedido());
            ps.setString(3, pedido.getEstado());
            ps.setDouble(4, pedido.getTotal());
            ps.executeUpdate();
        }
    }

    private void validatePedido(Pedido pedido) {
        if (pedido.getClienteId() <= 0) {
            throw new IllegalArgumentException("Debe seleccionar un cliente válido.");
        }
        if (pedido.getTotal() < 0) {
            throw new IllegalArgumentException("El total del pedido no puede ser negativo.");
        }
    }

    public ResultSet obtenerPedidos() throws SQLException {
        String sql = """
            SELECT p.id, p.cliente_id, c.nombre as cliente_nombre, p.fecha_pedido, p.estado, p.total
            FROM Pedido p
            LEFT JOIN Cliente c ON p.cliente_id = c.id
            ORDER BY p.id DESC
        """;
        Statement stmt = connection.createStatement();
        return stmt.executeQuery(sql);
    }

    public void close() throws SQLException {
        if (connection != null && !connection.isClosed()) {
            connection.close();
        }
    }
}