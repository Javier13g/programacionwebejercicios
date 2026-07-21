package com.sistema.empleado.services;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.sistema.empleado.dto.LoginResponseDto;
import com.sistema.empleado.dto.PageResponse;
import com.sistema.empleado.dto.UsuarioRequestDto;
import com.sistema.empleado.models.UsuariosModel;
import com.sistema.empleado.repositories.IEmpleadosRepository;
import com.sistema.empleado.repositories.IUsuariosRepository;
import com.sistema.empleado.security.JwtService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UsuariosService {

    @Autowired
    IUsuariosRepository usuariosRepository;

    @Autowired
    IEmpleadosRepository empleadosRepository;

    @Autowired
    JwtService jwtService;

    // Encoder BCrypt instanciado directo (es thread-safe).
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public PageResponse<UsuariosModel> getUsuarios(Pageable pageable) {
        // Solo usuarios NO borrados
        Page<UsuariosModel> page = usuariosRepository.findAllByDeletedFalse(pageable);
        return PageResponse.from(page);
    }

    public UsuariosModel getUsuarioById(Long id) {
        // Solo si NO está borrado
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

        if (dto.getEmpleadoId() != null) {
            usuario.setEmpleado(
                empleadosRepository.findById(dto.getEmpleadoId())
                    .orElseThrow(() -> new EntityNotFoundException(
                        "Empleado no encontrado con id " + dto.getEmpleadoId()))
            );
        }
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

            if (dto.getEmpleadoId() != null) {
                existing.setEmpleado(
                    empleadosRepository.findById(dto.getEmpleadoId())
                        .orElseThrow(() -> new EntityNotFoundException(
                            "Empleado no encontrado con id " + dto.getEmpleadoId()))
                );
            }
            return usuariosRepository.save(existing);
        });
    }

    public boolean deleteUsuario(Long id) {
        // SOFT DELETE: marcar como borrado en vez de eliminar
        Optional<UsuariosModel> opt = usuariosRepository.findByIdAndDeletedFalse(id);
        if (opt.isEmpty()) {
            return false;
        }
        UsuariosModel usuario = opt.get();
        usuario.setDeleted(true);
        usuario.setDeletedAt(LocalDateTime.now());
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
        String mensajeErrorGenerico = "Credenciales inválidas";

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