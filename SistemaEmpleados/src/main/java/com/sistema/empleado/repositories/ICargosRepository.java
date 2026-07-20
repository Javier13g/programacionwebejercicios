package com.sistema.empleado.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.CargosModel;

@Repository
public interface ICargosRepository extends JpaRepository<CargosModel, Long> {

}
