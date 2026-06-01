package ejercicio4;

import ejercicio4.business.ClienteService;
import ejercicio4.business.PedidoService;
import ejercicio4.business.ProductoService;
import ejercicio4.data.DatabaseManager;
import ejercicio4.model.Cliente;
import ejercicio4.model.Pedido;
import ejercicio4.model.Producto;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        DatabaseManager db = new DatabaseManager();
        ClienteService clienteService = new ClienteService(db);
        ProductoService productoService = new ProductoService(db);
        PedidoService pedidoService = new PedidoService(db);

        Scanner scanner = new Scanner(System.in);

        while (true) {
            System.out.println("\n========== SISTEMA DE PEDIDOS ==========");
            System.out.println("1. Registrar Cliente");
            System.out.println("2. Registrar Producto");
            System.out.println("3. Registrar Pedido");
            System.out.println("4. Mostrar Clientes");
            System.out.println("5. Mostrar Productos");
            System.out.println("6. Mostrar Pedidos");
            System.out.println("7. Buscar Producto por ID");
            System.out.println("8. Salir");
            System.out.print("Seleccione una opción: ");

            String entrada = scanner.nextLine();
            int opcion;
            try {
                opcion = Integer.parseInt(entrada);
            } catch (NumberFormatException e) {
                System.out.println("Opción inválida. Intente de nuevo.");
                continue;
            }

            switch (opcion) {
                case 1:
                    System.out.println("\n--- Registrar Cliente ---");
                    System.out.print("Nombre: ");
                    String nombre = LectorDatos.pedirString(scanner, 1, "Nombre");
                    System.out.print("Teléfono: ");
                    String telefono = LectorDatos.pedirString(scanner, 1, "Teléfono");
                    System.out.print("Dirección: ");
                    String direccion = LectorDatos.pedirString(scanner, 1, "Dirección");

                    Cliente cliente = new Cliente(0, nombre, telefono, direccion);
                    try {
                        clienteService.registrarCliente(cliente);
                        System.out.println("¡Cliente registrado exitosamente!");
                    } catch (Exception ex) {
                        System.out.println("Error: " + ex.getMessage());
                    }
                    break;

                case 2:
                    System.out.println("\n--- Registrar Producto ---");
                    System.out.print("Nombre: ");
                    String prodNombre = LectorDatos.pedirString(scanner, 1, "Nombre");
                    System.out.print("Precio: ");
                    double precio = LectorDatos.pedirDouble(scanner, "Precio");
                    System.out.print("Stock: ");
                    int stock = LectorDatos.pedirInt(scanner, "Stock");

                    Producto producto = new Producto(0, prodNombre, precio, stock);
                    try {
                        productoService.registrarProducto(producto);
                        System.out.println("¡Producto registrado exitosamente!");
                    } catch (Exception ex) {
                        System.out.println("Error: " + ex.getMessage());
                    }
                    break;

                case 3:
                    System.out.println("\n--- Registrar Pedido ---");
                    try {
                        clienteService.mostrarClientes();
                    } catch (Exception ex) {
                        System.out.println("Error al mostrar clientes: " + ex.getMessage());
                        break;
                    }
                    System.out.print("ID del cliente: ");
                    int clienteId = LectorDatos.pedirInt(scanner, "ID Cliente");

                    try {
                        if (clienteService.buscarClientePorId(clienteId) == null) {
                            System.out.println("Error: No existe un cliente con ese ID.");
                            break;
                        }
                    } catch (Exception ex) {
                        System.out.println("Error al validar cliente: " + ex.getMessage());
                        break;
                    }

                    System.out.print("Fecha del pedido (dd/MM/yyyy): ");
                    String fecha = LectorDatos.pedirFechaString(scanner);
                    System.out.print("Estado (Pendiente/Enviado/Entregado): ");
                    String estado = LectorDatos.pedirString(scanner, 1, "Estado");
                    System.out.print("Total: ");
                    double total = LectorDatos.pedirDouble(scanner, "Total");

                    Pedido pedido = new Pedido(0, clienteId, fecha, estado, total);
                    try {
                        pedidoService.registrarPedido(pedido);
                        System.out.println("¡Pedido registrado exitosamente!");
                    } catch (Exception ex) {
                        System.out.println("Error: " + ex.getMessage());
                    }
                    break;

                case 4:
                    try {
                        clienteService.mostrarClientes();
                    } catch (Exception ex) {
                        System.out.println("Error: " + ex.getMessage());
                    }
                    break;

                case 5:
                    try {
                        productoService.mostrarProductos();
                    } catch (Exception ex) {
                        System.out.println("Error: " + ex.getMessage());
                    }
                    break;

                case 6:
                    try {
                        pedidoService.mostrarPedidos();
                    } catch (Exception ex) {
                        System.out.println("Error: " + ex.getMessage());
                    }
                    break;

                case 7:
                    System.out.println("\n--- Buscar Producto por ID ---");
                    System.out.print("ID del producto: ");
                    int productoId = LectorDatos.pedirInt(scanner, "ID Producto");
                    try {
                        productoService.mostrarProductoPorId(productoId);
                    } catch (Exception ex) {
                        System.out.println("Error: " + ex.getMessage());
                    }
                    break;

                case 8:
                    System.out.println("Saliendo del sistema...");
                    try {
                        db.close();
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                    scanner.close();
                    return;

                default:
                    System.out.println("Opción no válida.");
            }
        }
    }
}