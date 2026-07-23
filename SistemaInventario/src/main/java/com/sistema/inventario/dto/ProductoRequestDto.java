package com.sistema.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class ProductoRequestDto {

    @NotBlank(message = "El SKU es obligatorio")
    @Size(min = 1, max = 50, message = "El SKU debe tener entre 1 y 50 caracteres")
    private String sku;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    private String nombre;

    @Size(max = 500, message = "La descripcion no puede superar los 500 caracteres")
    private String descripcion;

    @NotNull(message = "El precio de compra es obligatorio")
    @Positive(message = "El precio de compra debe ser mayor a 0")
    private Double precioCompra;

    @NotNull(message = "El precio de venta es obligatorio")
    @Positive(message = "El precio de venta debe ser mayor a 0")
    private Double precioVenta;

    @PositiveOrZero(message = "El stock actual debe ser mayor o igual a 0")
    private Integer stockActual;

    @PositiveOrZero(message = "El stock minimo debe ser mayor o igual a 0")
    private Integer stockMinimo;

    @NotNull(message = "El id de la categoria es obligatorio")
    @Positive(message = "El id de la categoria debe ser positivo")
    private Long categoriaId;

    @NotNull(message = "El id del proveedor es obligatorio")
    @Positive(message = "El id del proveedor debe ser positivo")
    private Long proveedorId;

    // URL publica de la imagen (opcional).
    // Si viene, se valida que sea una URL valida (http/https).
    // @org.hibernate.validator.constraints.URL valida formato y protocolo.
    @org.hibernate.validator.constraints.URL(protocol = "https",
            message = "La URL de la imagen debe ser valida (https://...)")
    @Size(max = 500)
    private String imageUrl;

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getPrecioCompra() {
        return precioCompra;
    }

    public void setPrecioCompra(Double precioCompra) {
        this.precioCompra = precioCompra;
    }

    public Double getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(Double precioVenta) {
        this.precioVenta = precioVenta;
    }

    public Integer getStockActual() {
        return stockActual;
    }

    public void setStockActual(Integer stockActual) {
        this.stockActual = stockActual;
    }

    public Integer getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(Integer stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Long categoriaId) {
        this.categoriaId = categoriaId;
    }

    public Long getProveedorId() {
        return proveedorId;
    }

    public void setProveedorId(Long proveedorId) {
        this.proveedorId = proveedorId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}