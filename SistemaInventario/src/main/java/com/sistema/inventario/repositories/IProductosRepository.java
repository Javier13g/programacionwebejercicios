package com.sistema.inventario.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistema.inventario.models.ProductosModel;

@Repository
public interface IProductosRepository extends JpaRepository<ProductosModel, Long> {

    /**
     * Búsqueda paginada combinando:
     *   - q           -> busca en sku, nombre o descripcion (parcial, case-insensitive)
     *   - categoriaId -> filtra por categoria exacta
     *   - proveedorId -> filtra por proveedor exacto
     *   - stockBajo   -> si true, devuelve solo los que tienen stockActual <= stockMinimo
     * Cualquier parámetro null/vacío se ignora. Siempre excluye productos borrados.
     */
    @Query("SELECT p FROM ProductosModel p " +
           "WHERE p.deleted = false " +
           "AND (:q IS NULL OR :q = '' " +
           "       OR LOWER(p.sku)        LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(p.nombre)     LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:categoriaId IS NULL OR p.categoria.id = :categoriaId) " +
           "AND (:proveedorId IS NULL OR p.proveedor.id = :proveedorId) " +
           "AND (:stockBajo IS NULL OR :stockBajo = false " +
           "       OR p.stockActual <= p.stockMinimo)")
    Page<ProductosModel> buscar(@Param("q") String q,
                               @Param("categoriaId") Long categoriaId,
                               @Param("proveedorId") Long proveedorId,
                               @Param("stockBajo") Boolean stockBajo,
                               Pageable pageable);

    /**
     * Busca un producto por id, excluyendo los borrados lógicamente.
     */
    Optional<ProductosModel> findByIdAndDeletedFalse(Long id);

    /**
     * Verifica si existe un producto activo con ese SKU
     * (ignora los borrados lógicamente para permitir reusar SKUs).
     */
    boolean existsBySkuAndDeletedFalse(String sku);
}