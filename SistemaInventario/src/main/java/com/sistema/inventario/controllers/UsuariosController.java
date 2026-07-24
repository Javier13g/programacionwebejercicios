package com.sistema.inventario.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sistema.inventario.dto.ApiError;
import com.sistema.inventario.dto.CambiarPasswordDto;
import com.sistema.inventario.dto.LoginResponseDto;
import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.dto.UsuarioEstadoDto;
import com.sistema.inventario.dto.UsuarioRequestDto;
import com.sistema.inventario.models.RolUsuario;
import com.sistema.inventario.models.UsuariosModel;
import com.sistema.inventario.services.UsuariosService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
public class UsuariosController {

    @Autowired
    private UsuariosService usuariosService;

    @GetMapping
    public PageResponse<UsuariosModel> getUsuarios(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) RolUsuario rol,
            @RequestParam(required = false, defaultValue = "false") boolean incluirDeshabilitados,
            Pageable pageable) {
        return usuariosService.getUsuarios(q, rol, incluirDeshabilitados, pageable);
    }

    @GetMapping("/{id}")
    public UsuariosModel getUsuarioById(@PathVariable Long id) {
        return usuariosService.getUsuarioById(id);
    }

    @GetMapping("/buscar")
    public UsuariosModel getUsuarioByUsername(@RequestParam String username) {
        return usuariosService.getUsuarioByUsername(username);
    }

    @PostMapping
    public ResponseEntity<UsuariosModel> saveUsuario(@Valid @RequestBody UsuarioRequestDto usuario) {
        UsuariosModel saved = usuariosService.saveUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UsuariosModel> updateUsuario(
            @PathVariable Long id, @RequestBody UsuarioRequestDto dto) {
        return usuariosService.updateUsuario(id, dto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioEstadoDto dto,
            jakarta.servlet.http.HttpServletRequest request) {

        if (dto.getDeleted() == null) {
            ApiError error = new ApiError(
                    400, "Bad Request",
                    "El campo 'deleted' es obligatorio", request.getRequestURI());
            return ResponseEntity.badRequest().body(error);
        }

        return usuariosService.cambiarEstado(id, dto.getDeleted())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<?> cambiarPassword(
            @PathVariable Long id,
            @Valid @RequestBody CambiarPasswordDto dto,
            jakarta.servlet.http.HttpServletRequest request) {

        boolean ok;
        try {
            ok = usuariosService.cambiarPassword(id, dto.getPasswordActual(), dto.getPasswordNueva());
        } catch (jakarta.persistence.EntityNotFoundException ex) {
            ApiError error = new ApiError(404, "Not Found", ex.getMessage(), request.getRequestURI());
            return ResponseEntity.status(404).body(error);
        }

        if (ok) {
            return ResponseEntity.ok().build();
        }

        ApiError error = new ApiError(
                400,
                "Bad Request",
                "La contrasena actual es incorrecta",
                request.getRequestURI()
        );
        return ResponseEntity.status(400).body(error);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsuarioRequestDto credentials,
                                    jakarta.servlet.http.HttpServletRequest request) {
        LoginResponseDto resp = usuariosService.verificarCredenciales(
                credentials.getUsername(),
                credentials.getPassword());

        if (resp.isSuccess()) {
            return ResponseEntity.ok(resp);
        }

        ApiError error = new ApiError(
                401,
                "Unauthorized",
                resp.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(401).body(error);
    }
}