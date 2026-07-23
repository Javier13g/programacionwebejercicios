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
import com.sistema.inventario.dto.CategoriaEstadoDto;
import com.sistema.inventario.dto.CategoriaRequestDto;
import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.models.CategoriasModel;
import com.sistema.inventario.services.CategoriasService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/categorias")
public class CategoriasController {

    @Autowired
    private CategoriasService categoriasService;

    @GetMapping
    public PageResponse<CategoriasModel> getCategorias(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return categoriasService.getCategorias(q, pageable);
    }

    @GetMapping("/{id}")
    public CategoriasModel getCategoriaById(@PathVariable Long id) {
        return categoriasService.getCategoriaById(id);
    }

    @PostMapping
    public ResponseEntity<CategoriasModel> saveCategoria(
            @Valid @RequestBody CategoriaRequestDto categoria) {
        CategoriasModel saved = categoriasService.saveCategoria(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CategoriasModel> updateCategoria(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequestDto dto) {
        return categoriasService.updateCategoria(id, dto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Cambia el estado (habilitado / deshabilitado) de una categoria.
     * Body: { "deleted": true } para deshabilitar, { "deleted": false } para rehabilitar.
     *  - 204 si se aplicó el cambio
     *  - 404 si la categoria no existe
     *  - 400 si el body es inválido
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaEstadoDto dto,
            jakarta.servlet.http.HttpServletRequest request) {

        if (dto.getDeleted() == null) {
            ApiError error = new ApiError(
                    400, "Bad Request",
                    "El campo 'deleted' es obligatorio", request.getRequestURI());
            return ResponseEntity.badRequest().body(error);
        }

        return categoriasService.cambiarEstado(id, dto.getDeleted())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}