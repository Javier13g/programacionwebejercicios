package com.sistema.empleado.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistema.empleado.models.PasswordResetCode;

@Repository
public interface IPasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {
    Optional<PasswordResetCode> findByUsuarioId(Long usuarioId);
    Optional<PasswordResetCode> findByPhone(String phone);
    void deleteByUsuarioId(Long usuarioId);
}
