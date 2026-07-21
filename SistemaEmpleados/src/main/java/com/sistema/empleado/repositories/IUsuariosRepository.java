package com.sistema.empleado.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.UsuariosModel;

@Repository
public interface IUsuariosRepository extends JpaRepository<UsuariosModel, Long> {

    // Solo devuelve usuarios NO borrados
    Optional<UsuariosModel> findByUsername(String username);

    Optional<UsuariosModel> findByIdAndDeletedFalse(Long id);

    List<UsuariosModel> findAllByDeletedFalse();

    // Paginacion: solo usuarios NO borrados
    Page<UsuariosModel> findAllByDeletedFalse(Pageable pageable);
}
