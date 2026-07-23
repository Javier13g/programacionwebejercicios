package com.sistema.inventario.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistema.inventario.models.CategoriasModel;

@Repository
public interface ICategoriasRepository extends JpaRepository<CategoriasModel, Long> {

    /**
     * Búsqueda paginada por nombre o descripción (case-insensitive, parcial).
     * Si q es null/vacía, devuelve todas las categorías no borradas.
     * Siempre excluye categorías borradas lógicamente.
     */
    @Query("SELECT c FROM CategoriasModel c " +
           "WHERE c.deleted = false " +
           "AND (:q IS NULL OR :q = '' " +
           "       OR LOWER(c.nombre)      LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<CategoriasModel> buscar(@Param("q") String q, Pageable pageable);

    /**
     * Busca una categoria por id, excluyendo las borradas lógicamente.
     */
    Optional<CategoriasModel> findByIdAndDeletedFalse(Long id);

    /**
     * Verifica si existe una categoria activa con ese nombre
     * (ignora las borradas lógicamente para permitir reusar nombres).
     */
    boolean existsByNombreAndDeletedFalse(String nombre);
}