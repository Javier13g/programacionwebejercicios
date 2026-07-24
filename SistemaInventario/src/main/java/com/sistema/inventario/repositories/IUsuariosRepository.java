package com.sistema.inventario.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistema.inventario.models.RolUsuario;
import com.sistema.inventario.models.UsuariosModel;

@Repository
public interface IUsuariosRepository extends JpaRepository<UsuariosModel, Long> {

    Optional<UsuariosModel> findByUsername(String username);

    Optional<UsuariosModel> findByIdAndDeletedFalse(Long id);

    List<UsuariosModel> findAllByDeletedFalse();

    Page<UsuariosModel> findAllByDeletedFalse(Pageable pageable);

    @Query("SELECT u FROM UsuariosModel u "
            + "WHERE u.deleted = false "
            + "AND (:q IS NULL OR :q = '' "
            + "     OR LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))) "
            + "AND (:rol IS NULL OR u.rol = :rol)")
    Page<UsuariosModel> buscar(@Param("q") String q,
            @Param("rol") RolUsuario rol,
            Pageable pageable);

    @Query("SELECT u FROM UsuariosModel u "
            + "WHERE (:q IS NULL OR :q = '' "
            + "     OR LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))) "
            + "AND (:rol IS NULL OR u.rol = :rol)")
    Page<UsuariosModel> buscarConDeshabilitados(@Param("q") String q,
            @Param("rol") RolUsuario rol,
            Pageable pageable);
}
