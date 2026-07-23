package com.sistema.inventario.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "productos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductosModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "precioCompra", nullable = false)
    private Double precioCompra;

    @Column(name = "precioVenta", nullable = false)
    private Double precioVenta;

    @Column(name = "stockActual", nullable = false)
    private Integer stockActual = 0;

    @Column(name = "stockMinimo", nullable = false)
    private Integer stockMinimo = 0;

    // URL publica de la imagen del producto (subida a Imgur).
    // Opcional: el producto puede existir sin imagen.
    @Column(name = "imageUrl", length = 500)
    private String imageUrl;

    // Hash que devuelve Imgur al subir una imagen.
    // Lo usamos para poder borrarla despues con DELETE /image/{deletehash}.
    @Column(name = "imageDeleteHash", length = 50)
    private String imageDeleteHash;

    // FK a categoría (obligatoria, un producto pertenece a una categoría)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoriaId", nullable = false)
    private CategoriasModel categoria;

    // FK a proveedor (obligatoria)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedorId", nullable = false)
    private ProveedoresModel proveedor;

    // === Soft Delete ===
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageDeleteHash() {
        return imageDeleteHash;
    }

    public void setImageDeleteHash(String imageDeleteHash) {
        this.imageDeleteHash = imageDeleteHash;
    }

    public CategoriasModel getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriasModel categoria) {
        this.categoria = categoria;
    }

    public ProveedoresModel getProveedor() {
        return proveedor;
    }

    public void setProveedor(ProveedoresModel proveedor) {
        this.proveedor = proveedor;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
