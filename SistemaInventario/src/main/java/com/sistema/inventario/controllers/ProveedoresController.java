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
import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.dto.ProveedorEstadoDto;
import com.sistema.inventario.dto.ProveedorRequestDto;
import com.sistema.inventario.models.ProveedoresModel;
import com.sistema.inventario.services.ProveedoresService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/proveedores")
public class ProveedoresController {

    @Autowired
    private ProveedoresService proveedoresService;

    @GetMapping
    public PageResponse<ProveedoresModel> getProveedores(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return proveedoresService.getProveedores(q, pageable);
    }

    @GetMapping("/{id}")
    public ProveedoresModel getProveedorById(@PathVariable Long id) {
        return proveedoresService.getProveedorById(id);
    }

    @PostMapping
    public ResponseEntity<ProveedoresModel> saveProveedor(
            @Valid @RequestBody ProveedorRequestDto proveedor) {
        ProveedoresModel saved = proveedoresService.saveProveedor(proveedor);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProveedoresModel> updateProveedor(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorRequestDto dto) {
        return proveedoresService.updateProveedor(id, dto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorEstadoDto dto,
            jakarta.servlet.http.HttpServletRequest request) {

        if (dto.getDeleted() == null) {
            ApiError error = new ApiError(
                    400, "Bad Request",
                    "El campo 'deleted' es obligatorio", request.getRequestURI());
            return ResponseEntity.badRequest().body(error);
        }

        return proveedoresService.cambiarEstado(id, dto.getDeleted())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}