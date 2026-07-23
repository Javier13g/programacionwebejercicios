package com.sistema.inventario.controllers;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sistema.inventario.dto.MovimientoRequestDto;
import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.models.MovimientosModel;
import com.sistema.inventario.models.TipoMovimiento;
import com.sistema.inventario.services.MovimientosService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/movimientos")
public class MovimientosController {

    @Autowired
    private MovimientosService movimientosService;

    /**
     * Búsqueda paginada con filtros combinables:
     *   q, productoId, usuarioId, tipo, desde, hasta
     */
    @GetMapping
    public PageResponse<MovimientosModel> getMovimientos(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) TipoMovimiento tipo,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
            Pageable pageable) {
        return movimientosService.getMovimientos(
                q, productoId, usuarioId, tipo, desde, hasta, pageable);
    }

    @GetMapping("/{id}")
    public MovimientosModel getMovimientoById(@PathVariable Long id) {
        return movimientosService.getMovimientoById(id);
    }

    @PostMapping
    public ResponseEntity<MovimientosModel> saveMovimiento(
            @Valid @RequestBody MovimientoRequestDto movimiento) {
        MovimientosModel saved = movimientosService.saveMovimiento(movimiento);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}