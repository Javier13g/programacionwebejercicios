package com.sistema.empleado.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.UsuariosModel;

@Repository
public interface IUsuariosRepository extends JpaRepository<UsuariosModel, Long> {

    Optional<UsuariosModel> findByUsername(String username);
}
