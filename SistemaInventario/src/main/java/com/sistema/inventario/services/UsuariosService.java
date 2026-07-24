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

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuariosService(JwtService jwtService, IUsuariosRepository usuariosRepository) {
        this.jwtService = jwtService;
        this.usuariosRepository = usuariosRepository;
    }

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
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setRol(dto.getRol());
        return usuariosRepository.save(usuario);
    }

    public Optional<UsuariosModel> updateUsuario(Long id, UsuarioRequestDto dto) {
        return usuariosRepository.findById(id).map(existing -> {
            if (dto.getUsername() != null) existing.setUsername(dto.getUsername());
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                existing.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
            if (dto.getRol() != null) existing.setRol(dto.getRol());
            return usuariosRepository.save(existing);
        });
    }

    public boolean cambiarEstado(Long id, boolean delete) {
        Optional<UsuariosModel> opt = usuariosRepository.findById(id);
        if (opt.isEmpty()) {
            return false;
        }
        UsuariosModel usuario = opt.get();

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

    public boolean cambiarPassword(Long userId, String passwordActual, String passwordNueva) {
        Optional<UsuariosModel> opt = usuariosRepository.findByIdAndDeletedFalse(userId);
        if (opt.isEmpty()) {
            throw new EntityNotFoundException("Usuario no encontrado con id " + userId);
        }

        UsuariosModel usuario = opt.get();

        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            return false;
        }

        usuario.setPassword(passwordEncoder.encode(passwordNueva));
        usuariosRepository.save(usuario);
        return true;
    }

    public LoginResponseDto verificarCredenciales(String username, String passwordPlano) {
        var usuarioOpt = usuariosRepository.findByUsername(username);
        String mensajeErrorGenerico = "Credenciales invalidas";

        if (usuarioOpt.isEmpty()) {
            return new LoginResponseDto(false, mensajeErrorGenerico, null, null, null);
        }

        UsuariosModel usuario = usuarioOpt.get();

        if (usuario.isDeleted()) {
            return new LoginResponseDto(false, mensajeErrorGenerico, null, null, null);
        }

        if (!passwordEncoder.matches(passwordPlano, usuario.getPassword())) {
            return new LoginResponseDto(false, mensajeErrorGenerico, null, null, null);
        }

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