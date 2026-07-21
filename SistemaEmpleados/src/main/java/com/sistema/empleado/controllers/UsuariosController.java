package com.sistema.empleado.controllers;

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

import com.sistema.empleado.dto.ApiError;
import com.sistema.empleado.dto.CambiarPasswordDto;
import com.sistema.empleado.dto.LoginResponseDto;
import com.sistema.empleado.dto.PageResponse;
import com.sistema.empleado.dto.UsuarioEstadoDto;
import com.sistema.empleado.dto.UsuarioRequestDto;
import com.sistema.empleado.models.RolUsuario;
import com.sistema.empleado.models.UsuariosModel;
import com.sistema.empleado.services.UsuariosService;

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

    /**
     * Cambia el estado (habilitado / deshabilitado) de un usuario.
     * Body: { "deleted": true } para deshabilitar, { "deleted": false } para rehabilitar.
     *  - 204 si se aplicó el cambio
     *  - 404 si el usuario no existe
     *  - 400 si el body es inválido
     */
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
    
    /**
     * Cambia la password del usuario.
     *  - 200 si se cambió OK
     *  - 400 si la contraseña actual no coincide
     *  - 404 si el usuario no existe
     */
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
                "La contraseña actual es incorrecta",
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

        // Devolvemos un ApiError en vez de solo 401 vacío
        ApiError error = new ApiError(
                401,
                "Unauthorized",
                resp.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(401).body(error);
    }
}