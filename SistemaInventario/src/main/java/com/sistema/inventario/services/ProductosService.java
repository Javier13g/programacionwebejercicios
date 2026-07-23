package com.sistema.inventario.services;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.dto.ProductoRequestDto;
import com.sistema.inventario.exceptions.ConflictException;
import com.sistema.inventario.models.CategoriasModel;
import com.sistema.inventario.models.ProductosModel;
import com.sistema.inventario.models.ProveedoresModel;
import com.sistema.inventario.repositories.ICategoriasRepository;
import com.sistema.inventario.repositories.IProductosRepository;
import com.sistema.inventario.repositories.IProveedoresRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ProductosService {

    private final IProductosRepository productosRepository;
    private final ICategoriasRepository categoriasRepository;
    private final IProveedoresRepository proveedoresRepository;

    // Constructor injection (recomendado por Spring sobre @Autowired en campos)
    public ProductosService(IProductosRepository productosRepository,
                            ICategoriasRepository categoriasRepository,
                            IProveedoresRepository proveedoresRepository) {
        this.productosRepository = productosRepository;
        this.categoriasRepository = categoriasRepository;
        this.proveedoresRepository = proveedoresRepository;
    }

    public PageResponse<ProductosModel> getProductos(String q,
                                                     Long categoriaId,
                                                     Long proveedorId,
                                                     Boolean stockBajo,
                                                     Pageable pageable) {
        Page<ProductosModel> page = productosRepository.buscar(q, categoriaId, proveedorId, stockBajo, pageable);
        return PageResponse.from(page);
    }

    public ProductosModel getProductoById(Long id) {
        return productosRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Producto no encontrado con id " + id));
    }

    public ProductosModel saveProducto(ProductoRequestDto dto) {
        // 1) SKU único entre productos activos
        if (productosRepository.existsBySkuAndDeletedFalse(dto.getSku())) {
            throw new ConflictException("Ya existe un producto activo con el SKU '" + dto.getSku() + "'");
        }

        // 2) Regla de negocio: precioVenta >= precioCompra
        // getPrecioCompra()/getPrecioVenta() no son null: @NotNull + @Positive en el DTO
        // y el controller valida con @Valid antes de invocar este metodo.
        // Unbox a primitivos para evitar warnings de unboxing posiblemente nulo.
        double precioCompra = dto.getPrecioCompra();
        double precioVenta = dto.getPrecioVenta();
        if (precioVenta < precioCompra) {
            throw new ConflictException(
                    "El precio de venta (" + precioVenta
                            + ") no puede ser menor al precio de compra (" + precioCompra + ")");
        }

        // 3) Resolver FKs (404 si no existen o están borradas)
        CategoriasModel categoria = categoriasRepository.findByIdAndDeletedFalse(dto.getCategoriaId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Categoria no encontrada con id " + dto.getCategoriaId()));
        ProveedoresModel proveedor = proveedoresRepository.findByIdAndDeletedFalse(dto.getProveedorId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Proveedor no encontrado con id " + dto.getProveedorId()));

        ProductosModel producto = new ProductosModel();
        producto.setSku(dto.getSku());
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecioCompra(dto.getPrecioCompra());
        producto.setPrecioVenta(dto.getPrecioVenta());
        // El modelo tiene default = 0 y la columna es NOT NULL;
        // Objects.requireNonNullElse evita el null check redundante.
        producto.setStockActual(Objects.requireNonNullElse(dto.getStockActual(), 0));
        producto.setStockMinimo(Objects.requireNonNullElse(dto.getStockMinimo(), 0));
        producto.setCategoria(categoria);
        producto.setProveedor(proveedor);
        producto.setImageUrl(dto.getImageUrl());
        return productosRepository.save(producto);
    }

    public Optional<ProductosModel> updateProducto(Long id, ProductoRequestDto dto) {
        return productosRepository.findByIdAndDeletedFalse(id).map(existing -> {
            // SKU: si cambia, verificar unicidad
            if (dto.getSku() != null
                    && !dto.getSku().equalsIgnoreCase(existing.getSku())
                    && productosRepository.existsBySkuAndDeletedFalse(dto.getSku())) {
                throw new ConflictException("Ya existe un producto activo con el SKU '" + dto.getSku() + "'");
            }

            // Regla de negocio: precioVenta >= precioCompra (sobre los valores finales)
            double nuevoCompra = dto.getPrecioCompra() != null ? dto.getPrecioCompra() : existing.getPrecioCompra();
            double nuevoVenta  = dto.getPrecioVenta()  != null ? dto.getPrecioVenta()  : existing.getPrecioVenta();
            if (nuevoVenta < nuevoCompra) {
                throw new ConflictException(
                        "El precio de venta (" + nuevoVenta
                                + ") no puede ser menor al precio de compra (" + nuevoCompra + ")");
            }

            // Campos simples
            if (dto.getSku() != null)         existing.setSku(dto.getSku());
            if (dto.getNombre() != null)      existing.setNombre(dto.getNombre());
            if (dto.getDescripcion() != null) existing.setDescripcion(dto.getDescripcion());
            if (dto.getPrecioCompra() != null) existing.setPrecioCompra(dto.getPrecioCompra());
            if (dto.getPrecioVenta() != null)  existing.setPrecioVenta(dto.getPrecioVenta());
            if (dto.getStockActual() != null)  existing.setStockActual(dto.getStockActual());
            if (dto.getStockMinimo() != null)  existing.setStockMinimo(dto.getStockMinimo());

            // FKs (si vienen en el PATCH, se resuelven; si no, se mantienen)
            if (dto.getCategoriaId() != null) {
                CategoriasModel categoria = categoriasRepository.findByIdAndDeletedFalse(dto.getCategoriaId())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Categoria no encontrada con id " + dto.getCategoriaId()));
                existing.setCategoria(categoria);
            }
            if (dto.getProveedorId() != null) {
                ProveedoresModel proveedor = proveedoresRepository.findByIdAndDeletedFalse(dto.getProveedorId())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Proveedor no encontrado con id " + dto.getProveedorId()));
                existing.setProveedor(proveedor);
            }
            // Si llega imageUrl en el PATCH, la actualizamos (acepta null para "quitar")
            if (dto.getImageUrl() != null) {
                existing.setImageUrl(dto.getImageUrl());
            }
            return productosRepository.save(existing);
        });
    }

    /**
     * Cambia el estado de un producto (habilitado / deshabilitado / soft-delete).
     *
     * @param id     id del producto
     * @param delete true  -> deshabilita (marca deleted=true y deletedAt=now)
     *               false -> rehabilita (marca deleted=false y limpia deletedAt)
     * @return true si se aplicó el cambio (o ya estaba en el estado pedido, idempotente).
     *         false si el id no existe.
     */
    public boolean cambiarEstado(Long id, boolean delete) {
        Optional<ProductosModel> opt = productosRepository.findById(id);
        if (opt.isEmpty()) {
            return false;
        }
        ProductosModel producto = opt.get();

        // Si rehabilitamos y ya hay otro activo con el mismo SKU -> no dejamos
        if (!delete && producto.isDeleted()
                && productosRepository.existsBySkuAndDeletedFalse(producto.getSku())) {
            throw new ConflictException(
                    "No se puede rehabilitar: ya existe un producto activo con el SKU '"
                            + producto.getSku() + "'");
        }

        // Idempotencia
        if (producto.isDeleted() == delete) {
            return true;
        }

        if (delete) {
            producto.setDeleted(true);
            producto.setDeletedAt(LocalDateTime.now());
        } else {
            producto.setDeleted(false);
            producto.setDeletedAt(null);
        }
        productosRepository.save(producto);
        return true;
    }
}