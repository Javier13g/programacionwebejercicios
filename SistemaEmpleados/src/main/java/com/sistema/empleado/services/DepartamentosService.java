
package com.sistema.empleado.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sistema.empleado.dto.DepartamentoRequestDto;
import com.sistema.empleado.dto.PageResponse;
import com.sistema.empleado.models.DepartamentosModel;
import com.sistema.empleado.repositories.IDepartamentosRepository;
import com.sistema.empleado.repositories.IEmpleadosRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class DepartamentosService {

    @Autowired
    IDepartamentosRepository departamentosRepository;

    @Autowired
    IEmpleadosRepository empleadosRepository;

    public PageResponse<DepartamentosModel> getDepartamentos(Pageable pageable) {
        Page<DepartamentosModel> page = departamentosRepository.findAll(pageable);
        return PageResponse.from(page);
    }

    public DepartamentosModel getDepartamentoById(Long id) {
        return departamentosRepository.findById(id).orElse(null);
    }

    public DepartamentosModel saveDepartamento(DepartamentoRequestDto dto) {
        DepartamentosModel departamento = new DepartamentosModel();
        departamento.setNombre(dto.getNombre());
        departamento.setDescripcion(dto.getDescripcion());

        if (dto.getJefeId() != null) {
            departamento.setJefe(
                empleadosRepository.findById(dto.getJefeId())
                    .orElseThrow(() -> new EntityNotFoundException(
                        "Empleado (jefe) no encontrado con id " + dto.getJefeId()))
            );
        }
        return departamentosRepository.save(departamento);
    }

    public Optional<DepartamentosModel> updateDepartamento(Long id, DepartamentoRequestDto dto) {
        return departamentosRepository.findById(id).map(existing -> {
            if (dto.getNombre() != null) existing.setNombre(dto.getNombre());
            if (dto.getDescripcion() != null) existing.setDescripcion(dto.getDescripcion());

            if (dto.getJefeId() != null) {
                existing.setJefe(
                    empleadosRepository.findById(dto.getJefeId())
                        .orElseThrow(() -> new EntityNotFoundException(
                            "Empleado (jefe) no encontrado con id " + dto.getJefeId()))
                );
            }
            return departamentosRepository.save(existing);
        });
    }
}
