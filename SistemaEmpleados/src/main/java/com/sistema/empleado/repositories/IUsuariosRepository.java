package com.sistema.empleado.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.RolUsuario;
import com.sistema.empleado.models.UsuariosModel;

@Repository
public interface IUsuariosRepository extends JpaRepository<UsuariosModel, Long> {

    // Solo devuelve usuarios NO borrados
    Optional<UsuariosModel> findByUsername(String username);

    Optional<UsuariosModel> findByEmpleadoId(Long empleadoId);

    Optional<UsuariosModel> findByIdAndDeletedFalse(Long id);

    List<UsuariosModel> findAllByDeletedFalse();

    // Paginacion: solo usuarios NO borrados
    Page<UsuariosModel> findAllByDeletedFalse(Pageable pageable);

    /**
     * Búsqueda paginada por username (parcial, case-insensitive)
     * y/o rol (exacto). Siempre excluye usuarios borrados.
     * Cualquier parámetro null/vacío se ignora.
     */
    @Query("SELECT u FROM UsuariosModel u " +
           "WHERE u.deleted = false " +
           "AND (:q IS NULL OR :q = '' " +
           "     OR LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:rol IS NULL OR u.rol = :rol)")
    Page<UsuariosModel> buscar(@Param("q") String q,
                               @Param("rol") RolUsuario rol,
                               Pageable pageable);

    /**
     * Búsqueda paginada incluyendo usuarios deshabilitados.
     * Misma lógica de filtros que {@link #buscar}, pero sin la cláusula u.deleted = false.
     */
    @Query("SELECT u FROM UsuariosModel u " +
           "WHERE (:q IS NULL OR :q = '' " +
           "     OR LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:rol IS NULL OR u.rol = :rol)")
    Page<UsuariosModel> buscarConDeshabilitados(@Param("q") String q,
                                                @Param("rol") RolUsuario rol,
                                                Pageable pageable);
}
