package com.sistema.empleado.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.DepartamentosModel;

@Repository
public interface IDepartamentosRepository extends JpaRepository<DepartamentosModel, Long> {

    /**
     * Búsqueda paginada por nombre o descripción (case-insensitive, parcial).
     * Si q es null/vacía, devuelve todos los departamentos paginados.
     */
    @Query("SELECT d FROM DepartamentosModel d " +
           "WHERE (:q IS NULL OR :q = '' " +
           "       OR LOWER(d.nombre)      LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(d.descripcion) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<DepartamentosModel> buscar(@Param("q") String q, Pageable pageable);
}
