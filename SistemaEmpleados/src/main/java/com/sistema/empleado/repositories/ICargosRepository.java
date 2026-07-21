package com.sistema.empleado.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.CargosModel;
import com.sistema.empleado.models.NivelCargo;

@Repository
public interface ICargosRepository extends JpaRepository<CargosModel, Long> {

    /**
     * Búsqueda paginada combinando nombre (parcial, case-insensitive)
     * y nivel (exacto). Cualquier parámetro null/vacío se ignora.
     */
    @Query("SELECT c FROM CargosModel c " +
           "WHERE (:q IS NULL OR :q = '' " +
           "       OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:nivel IS NULL OR c.nivel = :nivel)")
    Page<CargosModel> buscar(@Param("q") String q,
                             @Param("nivel") NivelCargo nivel,
                             Pageable pageable);
}
