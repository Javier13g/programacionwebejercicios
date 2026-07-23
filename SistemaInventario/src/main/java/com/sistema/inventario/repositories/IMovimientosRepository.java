package com.sistema.inventario.repositories;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistema.inventario.models.MovimientosModel;
import com.sistema.inventario.models.TipoMovimiento;

@Repository
public interface IMovimientosRepository extends JpaRepository<MovimientosModel, Long> {

    /**
     * Búsqueda paginada combinando:
     *   - q          -> busca en observacion o sku/nombre del producto (parcial, case-insensitive)
     *   - productoId -> filtra por producto exacto
     *   - usuarioId  -> filtra por usuario exacto
     *   - tipo       -> filtra por tipo exacto (ENTRADA / SALIDA / AJUSTE)
     *   - desde / hasta -> rango de fechas (inclusive en ambos extremos)
     * Cualquier parámetro null/vacío se ignora.
     */
    @Query("SELECT m FROM MovimientosModel m " +
           "WHERE (:q IS NULL OR :q = '' " +
           "       OR LOWER(m.observacion)        LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(m.producto.sku)       LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(m.producto.nombre)    LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:productoId IS NULL OR m.producto.id = :productoId) " +
           "AND (:usuarioId  IS NULL OR m.usuario.id  = :usuarioId) " +
           "AND (:tipo       IS NULL OR m.tipo = :tipo) " +
           "AND (:desde IS NULL OR m.fecha >= :desde) " +
           "AND (:hasta IS NULL OR m.fecha <= :hasta)")
    Page<MovimientosModel> buscar(@Param("q") String q,
                                  @Param("productoId") Long productoId,
                                  @Param("usuarioId") Long usuarioId,
                                  @Param("tipo") TipoMovimiento tipo,
                                  @Param("desde") LocalDateTime desde,
                                  @Param("hasta") LocalDateTime hasta,
                                  Pageable pageable);
}