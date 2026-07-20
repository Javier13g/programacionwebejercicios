package com.sistema.empleado.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.EmpleadosModel;

@Repository
public interface IEmpleadosRepository extends JpaRepository<EmpleadosModel, Long> {

    Optional<EmpleadosModel> findByCedula(String cedula);

    Optional<EmpleadosModel> findByEmail(String email);
}
