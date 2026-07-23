package com.sistema.inventario.services;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.sistema.inventario.dto.LoginResponseDto;
import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.dto.UsuarioRequestDto;
import com.sistema.inventario.models.RolUsuario;
import com.sistema.inventario.models.UsuariosModel;
import com.sistema.inventario.repositories.IUsuariosRepository;
import com.sistema.inventario.security.JwtService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UsuariosService {

    @Autowired
    IUsuariosRepository usuariosRepository;

    @Autowired
    JwtService jwtService;

    // Encoder BCrypt instanciado directo (es thread-safe).
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public PageResponse<UsuariosModel> getUsuarios(String q, RolUsuario rol, boolean incluirDeshabilitados, Pageable pageable) {
        Page<UsuariosModel> page = incluirDeshabilitados
                ? usuariosRepository.buscarConDeshabilitados(q, rol, pageable)
                : usuariosRepository.buscar(q, rol, pageable);
        return PageResponse.from(page);
    }

    public UsuariosModel getUsuarioById(Long id) {
        return usuariosRepository.findByIdAndDeletedFalse(id).orElse(null);
    }

    public UsuariosModel getUsuarioByUsername(String username) {
        return usuariosRepository.findByUsername(username).orElse(null);
    }

    public UsuariosModel saveUsuario(UsuarioRequestDto dto) {
        UsuariosModel usuario = new UsuariosModel();
        usuario.setUsername(dto.getUsername());
        // Hasheamos SIEMPRE antes de guardar
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setRol(dto.getRol());
        return usuariosRepository.save(usuario);
    }

    public Optional<UsuariosModel> updateUsuario(Long id, UsuarioRequestDto dto) {
        return usuariosRepository.findById(id).map(existing -> {
            if (dto.getUsername() != null) existing.setUsername(dto.getUsername());
            // Si viene password nuevo, lo hasheamos; si no viene, conservamos el actual
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                existing.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
            if (dto.getRol() != null) existing.setRol(dto.getRol());
            return usuariosRepository.save(existing);
        });
    }

    /**
     * Cambia el estado de un usuario (habilitado / deshabilitado / soft-delete).
     *
     * @param id     id del usuario
     * @param delete true  -> deshabilita (marca deleted=true y deletedAt=now)
     *               false -> rehabilita (marca deleted=false y limpia deletedAt)
     * @return true si se aplicó el cambio, false si el id no existe
     *         (idempotente si el estado ya era el solicitado).
     */
    public boolean cambiarEstado(Long id, boolean delete) {
        Optional<UsuariosModel> opt = usuariosRepository.findById(id);
        if (opt.isEmpty()) {
            return false;
        }
        UsuariosModel usuario = opt.get();

        // Idempotencia: si ya está en el estado pedido, no hacemos nada pero devolvemos true.
        if (usuario.isDeleted() == delete) {
            return true;
        }

        if (delete) {
            usuario.setDeleted(true);
            usuario.setDeletedAt(LocalDateTime.now());
        } else {
            usuario.setDeleted(false);
            usuario.setDeletedAt(null);
        }
        usuariosRepository.save(usuario);
        return true;
    }

    /**
     * Cambia la password del usuario verificando la contraseña actual.
     * Devuelve true si se cambió, false si la password actual no coincide.
     */
    public boolean cambiarPassword(Long userId, String passwordActual, String passwordNueva) {
        Optional<UsuariosModel> opt = usuariosRepository.findByIdAndDeletedFalse(userId);
        if (opt.isEmpty()) {
            throw new EntityNotFoundException("Usuario no encontrado con id " + userId);
        }

        UsuariosModel usuario = opt.get();

        // Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            return false;
        }

        // Hashear y guardar la nueva
        usuario.setPassword(passwordEncoder.encode(passwordNueva));
        usuariosRepository.save(usuario);
        return true;
    }

    /**
     * Verifica credenciales. Devuelve un LoginResponseDto con:
     *  - success=true y datos del usuario si las credenciales son correctas
     *  - success=false y mensaje descriptivo si fallan (usuario inexistente o password incorrecto)
     *
     * El controller decide qué status HTTP devolver según success.
     */
    public LoginResponseDto verificarCredenciales(String username, String passwordPlano) {
        var usuarioOpt = usuariosRepository.findByUsername(username);
        String mensajeErrorGenerico = "Credenciales invalidas";

        // Caso 1: el usuario no existe
        if (usuarioOpt.isEmpty()) {
            return new LoginResponseDto(false, mensajeErrorGenerico, null, null, null);
        }

        UsuariosModel usuario = usuarioOpt.get();

        // Caso 1.5: el usuario fue borrado (soft delete) — no dejamos loguearse
        if (usuario.isDeleted()) {
            return new LoginResponseDto(false, mensajeErrorGenerico, null, null, null);
        }

        // Caso 2: la contraseña no coincide
        if (!passwordEncoder.matches(passwordPlano, usuario.getPassword())) {
            return new LoginResponseDto(false, mensajeErrorGenerico, null, null, null);
        }

        // Caso 3: todo OK -> generamos el JWT
        String token = jwtService.generateToken(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRol().name()
        );

        return new LoginResponseDto(
                true,
                "Login exitoso",
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRol(),
                token,
                "Bearer",
                jwtService.getExpirationMs()
        );
    }
}