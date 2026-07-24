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

    @Query("SELECT c FROM CategoriasModel c " +
           "WHERE c.deleted = false " +
           "AND (:q IS NULL OR :q = '' " +
           "       OR LOWER(c.nombre)      LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<CategoriasModel> buscar(@Param("q") String q, Pageable pageable);

    Optional<CategoriasModel> findByIdAndDeletedFalse(Long id);

    boolean existsByNombreAndDeletedFalse(String nombre);
}