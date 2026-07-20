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

import com.sistema.empleado.dto.EmpleadoRequestDto;
import com.sistema.empleado.dto.PageResponse;
import com.sistema.empleado.models.EmpleadosModel;
import com.sistema.empleado.services.EmpleadosService;

@RestController
@RequestMapping("/empleados")
public class EmpleadosController {
    @Autowired
    private EmpleadosService empleadosService;

    @GetMapping
    public PageResponse<EmpleadosModel> getEmpleados(Pageable pageable) {
        return empleadosService.getEmpleados(pageable);
    }

    @GetMapping("/{id}")
    public EmpleadosModel getEmpleadoById(@PathVariable Long id) {
        return empleadosService.getEmpleadoById(id);
    }

    @GetMapping("/buscar")
    public EmpleadosModel buscar(
            @RequestParam(required = false) String cedula,
            @RequestParam(required = false) String email) {
        if (cedula != null) {
            return empleadosService.getEmpleadoByCedula(cedula);
        }
        if (email != null) {
            return empleadosService.getEmpleadoByEmail(email);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<EmpleadosModel> saveEmpleado(@RequestBody EmpleadoRequestDto empleado) {
        EmpleadosModel saved = empleadosService.saveEmpleado(empleado);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EmpleadosModel> updateEmpleado(
            @PathVariable Long id, @RequestBody EmpleadoRequestDto dto) {
        return empleadosService.updateEmpleado(id, dto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
