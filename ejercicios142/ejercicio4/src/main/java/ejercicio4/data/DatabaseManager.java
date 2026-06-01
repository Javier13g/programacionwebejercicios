package ejercicio4.data;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
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
            initializeTables();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    //Esto crea las tablas iniciales
    private void initializeTables() throws Exception {
        Statement stmt = connection.createStatement();

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

        stmt.close();
        insertarDatosIniciales();
    }

    // Esto inserta algunos datos iniciales para probar la aplicación
    private void insertarDatosIniciales() throws Exception {
        Statement stmt = connection.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as total FROM Cliente");
        if (rs.next() && rs.getInt("total") == 0) {
            stmt.execute("INSERT INTO Cliente (nombre, telefono, direccion) VALUES ('Juan Pérez', '555-1234', 'Calle Principal #123')");
            stmt.execute("INSERT INTO Cliente (nombre, telefono, direccion) VALUES ('María López', '555-5678', 'Avenida Central #456')");
        }
        rs.close();

        rs = stmt.executeQuery("SELECT COUNT(*) as total FROM Producto");
        if (rs.next() && rs.getInt("total") == 0) {
            stmt.execute("INSERT INTO Producto (nombre, precio, stock) VALUES ('Laptop HP', 15000.00, 10)");
            stmt.execute("INSERT INTO Producto (nombre, precio, stock) VALUES ('Mouse Inalámbrico', 250.50, 50)");
            stmt.execute("INSERT INTO Producto (nombre, precio, stock) VALUES ('Teclado Mecánico', 1200.00, 25)");
        }
        rs.close();

        rs = stmt.executeQuery("SELECT COUNT(*) as total FROM Pedido");
        if (rs.next() && rs.getInt("total") == 0) {
            stmt.execute("INSERT INTO Pedido (cliente_id, fecha_pedido, estado, total) VALUES (1, '01/06/2026', 'Entregado', 15250.50)");
            stmt.execute("INSERT INTO Pedido (cliente_id, fecha_pedido, estado, total) VALUES (2, '02/06/2026', 'Pendiente', 1200.00)");
        }
        rs.close();
        stmt.close();
    }

    //Metodos para manejar clientes
    public void insertarCliente(Cliente cliente) throws Exception {
        PreparedStatement ps = connection.prepareStatement(
            "INSERT INTO Cliente (nombre, telefono, direccion) VALUES (?, ?, ?)"
        );
        ps.setString(1, cliente.getNombre());
        ps.setString(2, cliente.getTelefono());
        ps.setString(3, cliente.getDireccion());
        ps.executeUpdate();
        ps.close();
    }

    public ResultSet obtenerClientes() throws Exception {
        Statement stmt = connection.createStatement();
        return stmt.executeQuery("SELECT * FROM Cliente ORDER BY id DESC");
    }

    public ResultSet obtenerClientePorId(int id) throws Exception {
        PreparedStatement ps = connection.prepareStatement("SELECT * FROM Cliente WHERE id = ?");
        ps.setInt(1, id);
        return ps.executeQuery();
    }

    //Metodos para manejar productos
    public void insertarProducto(Producto producto) throws Exception {
        PreparedStatement ps = connection.prepareStatement(
            "INSERT INTO Producto (nombre, precio, stock) VALUES (?, ?, ?)"
        );
        ps.setString(1, producto.getNombre());
        ps.setDouble(2, producto.getPrecio());
        ps.setInt(3, producto.getStock());
        ps.executeUpdate();
        ps.close();
    }

    public ResultSet obtenerProductos() throws Exception {
        Statement stmt = connection.createStatement();
        return stmt.executeQuery("SELECT * FROM Producto ORDER BY id DESC");
    }

    public ResultSet obtenerProductoPorId(int id) throws Exception {
        PreparedStatement ps = connection.prepareStatement("SELECT * FROM Producto WHERE id = ?");
        ps.setInt(1, id);
        return ps.executeQuery();
    }

    //Metodos para manejar pedidos
    public void insertarPedido(Pedido pedido) throws Exception {
        PreparedStatement ps = connection.prepareStatement(
            "INSERT INTO Pedido (cliente_id, fecha_pedido, estado, total) VALUES (?, ?, ?, ?)"
        );
        ps.setInt(1, pedido.getClienteId());
        ps.setString(2, pedido.getFechaPedido());
        ps.setString(3, pedido.getEstado());
        ps.setDouble(4, pedido.getTotal());
        ps.executeUpdate();
        ps.close();
    }

    public ResultSet obtenerPedidos() throws Exception {
        Statement stmt = connection.createStatement();
        return stmt.executeQuery("""
            SELECT p.id, p.cliente_id, c.nombre as cliente_nombre, p.fecha_pedido, p.estado, p.total
            FROM Pedido p
            LEFT JOIN Cliente c ON p.cliente_id = c.id
            ORDER BY p.id DESC
        """);
    }

    public void close() throws Exception {
        if (connection != null) {
            connection.close();
        }
    }
}