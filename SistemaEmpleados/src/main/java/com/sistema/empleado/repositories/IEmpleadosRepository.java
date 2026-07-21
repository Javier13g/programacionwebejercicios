package com.sistema.empleado.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.EmpleadosModel;
import com.sistema.empleado.models.EstadoEmpleado;

@Repository
public interface IEmpleadosRepository extends JpaRepository<EmpleadosModel, Long> {

    Optional<EmpleadosModel> findByCedula(String cedula);

    Optional<EmpleadosModel> findByEmail(String email);
    @Query("SELECT e FROM EmpleadosModel e LEFT JOIN FETCH e.cargo " +
           "WHERE e.estado = :estado " +
           "ORDER BY e.nombre, e.apellido")
    List<EmpleadosModel> findAllByEstadoConCargo(EstadoEmpleado estado);
    default List<EmpleadosModel> findAllConCargo() {
        return findAllByEstadoConCargo(EstadoEmpleado.activo);
    }
}
