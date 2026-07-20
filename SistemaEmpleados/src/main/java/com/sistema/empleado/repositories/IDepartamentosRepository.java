package com.sistema.empleado.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.DepartamentosModel;

@Repository
public interface IDepartamentosRepository extends JpaRepository<DepartamentosModel, Long> {

}
