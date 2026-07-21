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
import org.springframework.web.bind.annotation.RestController;

import com.sistema.empleado.dto.CargoRequestDto;
import com.sistema.empleado.dto.PageResponse;
import com.sistema.empleado.models.CargosModel;
import com.sistema.empleado.services.CargosService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/cargos")
public class CargosController {
    @Autowired
    private CargosService cargosService;

    @GetMapping
    public PageResponse<CargosModel> getCargos(Pageable pageable) {
        return cargosService.getCargos(pageable);
    }

    @GetMapping("/{id}")
    public CargosModel getCargoById(@PathVariable Long id) {
        return cargosService.getCargoById(id);
    }

    @PostMapping
    public ResponseEntity<CargosModel> saveCargo(@Valid @RequestBody CargoRequestDto cargo) {
        CargosModel saved = cargosService.saveCargo(cargo);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CargosModel> updateCargo(
            @PathVariable Long id, @Valid @RequestBody CargosModel cargo) {
        return cargosService.updateCargo(id, cargo)
                .map(updatedCargo -> ResponseEntity.ok(updatedCargo))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
