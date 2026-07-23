package com.sistema.inventario.services;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sistema.inventario.dto.MovimientoRequestDto;
import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.exceptions.ConflictException;
import com.sistema.inventario.models.MovimientosModel;
import com.sistema.inventario.models.ProductosModel;
import com.sistema.inventario.models.TipoMovimiento;
import com.sistema.inventario.models.UsuariosModel;
import com.sistema.inventario.repositories.IMovimientosRepository;
import com.sistema.inventario.repositories.IProductosRepository;
import com.sistema.inventario.repositories.IUsuariosRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class MovimientosService {

    private final IMovimientosRepository movimientosRepository;
    private final IProductosRepository productosRepository;
    private final IUsuariosRepository usuariosRepository;

    // Constructor injection (recomendado por Spring sobre @Autowired en campos)
    public MovimientosService(IMovimientosRepository movimientosRepository,
                              IProductosRepository productosRepository,
                              IUsuariosRepository usuariosRepository) {
        this.movimientosRepository = movimientosRepository;
        this.productosRepository = productosRepository;
        this.usuariosRepository = usuariosRepository;
    }

    public PageResponse<MovimientosModel> getMovimientos(String q,
            Long productoId,
            Long usuarioId,
            TipoMovimiento tipo,
            LocalDateTime desde,
            LocalDateTime hasta,
            Pageable pageable) {
        Page<MovimientosModel> page = movimientosRepository.buscar(
                q, productoId, usuarioId, tipo, desde, hasta, pageable);
        return PageResponse.from(page);
    }

    public MovimientosModel getMovimientoById(Long id) {
        return movimientosRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Movimiento no encontrado con id " + id));
    }

    /**
     * Registra un movimiento y actualiza el stock del producto en la misma
     * transacción. Si falla la actualización de stock, se hace rollback del
     * movimiento también.
     *
     * Reglas:
     * - ENTRADA : stockActual += cantidad
     * - SALIDA : requiere stockActual >= cantidad (sino 409); stockActual -=
     * cantidad
     * - AJUSTE : stockActual = cantidad (reemplazo absoluto)
     */
    @Transactional
    public MovimientosModel saveMovimiento(MovimientoRequestDto dto) {
        // 1) Resolver FKs (404 si no existen o están borrados)
        ProductosModel producto = productosRepository.findByIdAndDeletedFalse(dto.getProductoId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Producto no encontrado con id " + dto.getProductoId()));
        UsuariosModel usuario = usuariosRepository.findByIdAndDeletedFalse(dto.getUsuarioId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Usuario no encontrado con id " + dto.getUsuarioId()));

        // getStockActual() no es null: columna NOT NULL con default 0 en BD.
        // dto.getCantidad() no es null: @NotNull + @Positive en el DTO.
        // Unbox a primitivos para evitar warnings de unboxing posiblemente nulo.
        int stockAntes = producto.getStockActual();
        int cantidad = dto.getCantidad();
        int nuevoStock;

        switch (dto.getTipo()) {
            case ENTRADA -> {
                nuevoStock = stockAntes + cantidad;
            }
            case SALIDA -> {
                if (stockAntes < cantidad) {
                    throw new ConflictException(
                            "Stock insuficiente para realizar la salida. Stock actual: "
                                    + stockAntes + ", cantidad solicitada: " + cantidad);
                }
                nuevoStock = stockAntes - cantidad;
            }
            case AJUSTE -> {
                nuevoStock = cantidad;
            }
            default -> throw new ConflictException(
                    "Tipo de movimiento no soportado: " + dto.getTipo());
        }

        // 3) Persistir el movimiento
        MovimientosModel mov = new MovimientosModel();
        mov.setFecha(LocalDateTime.now());
        mov.setTipo(dto.getTipo());
        mov.setCantidad(cantidad);
        mov.setObservacion(dto.getObservacion());
        mov.setProducto(producto);
        mov.setUsuario(usuario);
        MovimientosModel saved = movimientosRepository.save(mov);

        // 4) Actualizar el stock del producto
        producto.setStockActual(nuevoStock);
        productosRepository.save(producto);

        return saved;
    }
}