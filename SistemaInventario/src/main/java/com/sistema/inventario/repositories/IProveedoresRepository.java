package com.sistema.inventario.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistema.inventario.models.ProveedoresModel;

@Repository
public interface IProveedoresRepository extends JpaRepository<ProveedoresModel, Long> {

    @Query("SELECT p FROM ProveedoresModel p " +
           "WHERE p.deleted = false " +
           "AND (:q IS NULL OR :q = '' " +
           "       OR LOWER(p.nombre)   LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(p.contacto) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(p.email)    LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(p.telefono) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<ProveedoresModel> buscar(@Param("q") String q, Pageable pageable);

    Optional<ProveedoresModel> findByIdAndDeletedFalse(Long id);

    boolean existsByNombreAndDeletedFalse(String nombre);
}