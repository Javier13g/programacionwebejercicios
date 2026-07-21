package com.sistema.empleado.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sistema.empleado.dto.EmpleadoRequestDto;
import com.sistema.empleado.dto.PageResponse;
import com.sistema.empleado.models.EmpleadosModel;
import com.sistema.empleado.repositories.ICargosRepository;
import com.sistema.empleado.repositories.IDepartamentosRepository;
import com.sistema.empleado.repositories.IEmpleadosRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class EmpleadosService {
    @Autowired
    IEmpleadosRepository empleadosRepository;

    @Autowired
    IDepartamentosRepository departamentosRepository;

    @Autowired
    ICargosRepository cargosRepository;

    public PageResponse<EmpleadosModel> getEmpleados(Pageable pageable) {
        Page<EmpleadosModel> page = empleadosRepository.findAll(pageable);
        return PageResponse.from(page);
    }

    public EmpleadosModel getEmpleadoById(Long id) {
        return empleadosRepository.findById(id).orElse(null);
    }

    public EmpleadosModel getEmpleadoByCedula(String cedula) {
        return empleadosRepository.findByCedula(cedula).orElse(null);
    }

    public EmpleadosModel getEmpleadoByEmail(String email) {
        return empleadosRepository.findByEmail(email).orElse(null);
    }

    /**
     * Devuelve los empleados activos con su cargo, para popular el dropdown
     * "Jefe" del formulario. La regla de filtrado (mismo departamento + CEO)
     * la aplica el frontend.
     */
    public List<EmpleadosModel> getCandidatosJefe() {
        return empleadosRepository.findAllByEstadoConCargo(
            com.sistema.empleado.models.EstadoEmpleado.activo);
    }

    public EmpleadosModel saveEmpleado(EmpleadoRequestDto dto) {
        EmpleadosModel empleado = new EmpleadosModel();
        empleado.setCedula(dto.getCedula());
        empleado.setNombre(dto.getNombre());
        empleado.setApellido(dto.getApellido());
        empleado.setEmail(dto.getEmail());
        empleado.setTelefono(dto.getTelefono());
        empleado.setFechaIngreso(dto.getFechaIngreso());
        empleado.setEstado(dto.getEstado());

        if (dto.getDepartamentoId() != null) {
            empleado.setDepartamento(
                departamentosRepository.findById(dto.getDepartamentoId())
                    .orElseThrow(() -> new EntityNotFoundException(
                        "Departamento no encontrado con id " + dto.getDepartamentoId()))
            );
        }
        if (dto.getCargoId() != null) {
            empleado.setCargo(
                cargosRepository.findById(dto.getCargoId())
                    .orElseThrow(() -> new EntityNotFoundException(
                        "Cargo no encontrado con id " + dto.getCargoId()))
            );
        }
        if (dto.getJefeId() != null) {
            empleado.setJefe(
                empleadosRepository.findById(dto.getJefeId())
                    .orElseThrow(() -> new EntityNotFoundException(
                        "Jefe no encontrado con id " + dto.getJefeId()))
            );
        }

        return empleadosRepository.save(empleado);
    }

    public Optional<EmpleadosModel> updateEmpleado(Long id, EmpleadoRequestDto dto) {
        return empleadosRepository.findById(id).map(existing -> {
            if (dto.getCedula() != null) existing.setCedula(dto.getCedula());
            if (dto.getNombre() != null) existing.setNombre(dto.getNombre());
            if (dto.getApellido() != null) existing.setApellido(dto.getApellido());
            if (dto.getEmail() != null) existing.setEmail(dto.getEmail());
            if (dto.getTelefono() != null) existing.setTelefono(dto.getTelefono());
            if (dto.getFechaIngreso() != null) existing.setFechaIngreso(dto.getFechaIngreso());
            if (dto.getEstado() != null) existing.setEstado(dto.getEstado());

            if (dto.getDepartamentoId() != null) {
                existing.setDepartamento(
                    departamentosRepository.findById(dto.getDepartamentoId())
                        .orElseThrow(() -> new EntityNotFoundException(
                            "Departamento no encontrado con id " + dto.getDepartamentoId()))
                );
            }
            if (dto.getCargoId() != null) {
                existing.setCargo(
                    cargosRepository.findById(dto.getCargoId())
                        .orElseThrow(() -> new EntityNotFoundException(
                            "Cargo no encontrado con id " + dto.getCargoId()))
                );
            }
            if (dto.getJefeId() != null) {
                existing.setJefe(
                    empleadosRepository.findById(dto.getJefeId())
                        .orElseThrow(() -> new EntityNotFoundException(
                            "Jefe no encontrado con id " + dto.getJefeId()))
                );
            }

            return empleadosRepository.save(existing);
        });
    }
}
