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
import ejercicio4.model.DetallePedido;

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
            stmt.execute(
                "CREATE TABLE IF NOT EXISTS Cliente (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "nombre TEXT NOT NULL," +
                "telefono TEXT," +
                "direccion TEXT)"
            );

            stmt.execute(
                "CREATE TABLE IF NOT EXISTS Producto (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "nombre TEXT NOT NULL," +
                "precio REAL NOT NULL," +
                "stock INTEGER NOT NULL)"
            );

            stmt.execute(
                "CREATE TABLE IF NOT EXISTS Pedido (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "cliente_id INTEGER NOT NULL," +
                "fecha_pedido TEXT NOT NULL," +
                "estado TEXT NOT NULL," +
                "total REAL NOT NULL," +
                "FOREIGN KEY (cliente_id) REFERENCES Cliente(id))"
            );

            stmt.execute(
                "CREATE TABLE IF NOT EXISTS PedidoProducto (" +
                "pedido_id INTEGER NOT NULL," +
                "producto_id INTEGER NOT NULL," +
                "cantidad INTEGER NOT NULL," +
                "PRIMARY KEY (pedido_id, producto_id)," +
                "FOREIGN KEY (pedido_id) REFERENCES Pedido(id)," +
                "FOREIGN KEY (producto_id) REFERENCES Producto(id))"
            );
        }
    }

    private void insertInitialDataIfEmpty() throws SQLException {
        if (!hasData("Cliente")) {
            insertClient(new Cliente(0, "Lebron James", "555-1234", "Calle Principal #123"));
            insertClient(new Cliente(0, "Sammy Sosa", "555-5678", "Avenida Central #456"));
        }

        if (!hasData("Producto")) {
            insertProduct(new Producto(0, "Laptop HP", 15000.00, 10));
            insertProduct(new Producto(0, "Mouse Inalámbrico", 250.50, 50));
            insertProduct(new Producto(0, "Teclado Mecánico", 1200.00, 25));
        }

        if (!hasData("Pedido") || !hasData("PedidoProducto")) {
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
            // Insertar datos iniciales de PedidoProducto
            insertPedidoProducto(1, 1, 1); // Pedido 1: 1 Laptop HP
            insertPedidoProducto(1, 2, 1); // Pedido 1: 1 Mouse
            insertPedidoProducto(2, 3, 1); // Pedido 2: 1 Teclado
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

    public ResultSet obtenerProductoPorIdLock(int id) throws SQLException {
        PreparedStatement ps = connection.prepareStatement("SELECT * FROM Producto WHERE id = ?");
        ps.setInt(1, id);
        return ps.executeQuery();
    }

    private void insertPedidoProducto(int pedidoId, int productoId, int cantidad) throws SQLException {
        String sql = "INSERT INTO PedidoProducto (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, pedidoId);
            ps.setInt(2, productoId);
            ps.setInt(3, cantidad);
            ps.executeUpdate();
        }
    }

    public void insertarDetallePedido(DetallePedido detalle) throws SQLException {
        if (detalle.getPedidoId() <= 0 || detalle.getProductoId() <= 0 || detalle.getCantidad() <= 0) {
            throw new IllegalArgumentException("Datos del detalle de pedido inválidos.");
        }
        insertPedidoProducto(detalle.getPedidoId(), detalle.getProductoId(), detalle.getCantidad());
    }

    public void reducirStock(int productoId, int cantidad) throws SQLException {
        String sql = "UPDATE Producto SET stock = stock - ? WHERE id = ? AND stock >= ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, cantidad);
            ps.setInt(2, productoId);
            ps.setInt(3, cantidad);
            int filasAfectadas = ps.executeUpdate();
            if (filasAfectadas == 0) {
                throw new SQLException("No se pudo reducir stock. Producto ID: " + productoId + ", cantidad: " + cantidad);
            }
        }
    }

    public int obtenerUltimoPedidoId() throws SQLException {
        String sql = "SELECT last_insert_rowid() as id";
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getInt("id");
            }
            throw new SQLException("No se pudo obtener el ID del último pedido.");
        }
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
        String sql = "SELECT p.id, p.cliente_id, c.nombre as cliente_nombre, " +
                     "p.fecha_pedido, p.estado, p.total " +
                     "FROM Pedido p " +
                     "LEFT JOIN Cliente c ON p.cliente_id = c.id " +
                     "ORDER BY p.id DESC";
        Statement stmt = connection.createStatement();
        return stmt.executeQuery(sql);
    }

    public ResultSet obtenerDetallePedido(int pedidoId) throws SQLException {
        String sql = "SELECT pp.producto_id, pr.nombre as producto_nombre, " +
                     "pp.cantidad, pr.precio " +
                     "FROM PedidoProducto pp " +
                     "JOIN Producto pr ON pp.producto_id = pr.id " +
                     "WHERE pp.pedido_id = ?";
        PreparedStatement ps = connection.prepareStatement(sql);
        ps.setInt(1, pedidoId);
        return ps.executeQuery();
    }

    public void close() throws SQLException {
        if (connection != null && !connection.isClosed()) {
            connection.close();
        }
    }
}