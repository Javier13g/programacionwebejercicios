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

import com.sistema.empleado.dto.DepartamentoRequestDto;
import com.sistema.empleado.dto.PageResponse;
import com.sistema.empleado.models.DepartamentosModel;
import com.sistema.empleado.services.DepartamentosService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/departamentos")
public class DepartamentosController {

    @Autowired
    private DepartamentosService departamentosService;

    @GetMapping
    public PageResponse<DepartamentosModel> getDepartamentos(Pageable pageable) {
        return departamentosService.getDepartamentos(pageable);
    }

    @GetMapping("/{id}")
    public DepartamentosModel getDepartamentoById(@PathVariable Long id) {
        return departamentosService.getDepartamentoById(id);
    }

    @PostMapping
    public ResponseEntity<DepartamentosModel> saveDepartamento(
            @Valid @RequestBody DepartamentoRequestDto departamento) {
        DepartamentosModel saved = departamentosService.saveDepartamento(departamento);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DepartamentosModel> updateDepartamento(
            @PathVariable Long id, @RequestBody DepartamentoRequestDto dto) {
        return departamentosService.updateDepartamento(id, dto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
