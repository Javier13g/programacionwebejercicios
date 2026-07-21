package com.sistema.empleado.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.EmpleadosModel;
import com.sistema.empleado.models.EstadoEmpleado;

@Repository
public interface IEmpleadosRepository extends JpaRepository<EmpleadosModel, Long> {

    Optional<EmpleadosModel> findByCedula(String cedula);

    Optional<EmpleadosModel> findByEmail(String email);

    Optional<EmpleadosModel> findByEmailIgnoreCase(String email);
    @Query("SELECT e FROM EmpleadosModel e LEFT JOIN FETCH e.cargo " +
           "WHERE e.estado = :estado AND e.id <> :excludeId " +
           "ORDER BY e.nombre, e.apellido")
    List<EmpleadosModel> findAllByEstadoConCargoExcluyendo(
            EstadoEmpleado estado, Long excludeId);

    @Query("SELECT e FROM EmpleadosModel e LEFT JOIN FETCH e.cargo " +
           "WHERE e.estado = :estado " +
           "ORDER BY e.nombre, e.apellido")
    List<EmpleadosModel> findAllByEstadoConCargo(EstadoEmpleado estado);
    default List<EmpleadosModel> findAllConCargo() {
        return findAllByEstadoConCargo(EstadoEmpleado.activo);
    }

    /**
     * Búsqueda exacta por teléfono. Útil para el flujo de reset por SMS.
     * Asume que el teléfono se guarda en formato E.164 (+5491145551234).
     */
    Optional<EmpleadosModel> findByTelefono(String telefono);

    /**
     * Búsqueda paginada por cédula o email (case-insensitive, parcial).
     * Si q es null/vacía, devuelve todos los empleados paginados.
     */
    @Query("SELECT e FROM EmpleadosModel e " +
           "WHERE (:q IS NULL OR :q = '' " +
           "       OR LOWER(e.cedula) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "       OR LOWER(e.email)  LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<EmpleadosModel> buscar(@Param("q") String q, Pageable pageable);
}
