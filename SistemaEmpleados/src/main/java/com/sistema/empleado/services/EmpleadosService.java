package com.sistema.empleado.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sistema.empleado.dto.EmpleadoRequestDto;
import com.sistema.empleado.dto.PageResponse;
import com.sistema.empleado.exceptions.ConflictException;
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

    public PageResponse<EmpleadosModel> getEmpleados(String q, Pageable pageable) {
        Page<EmpleadosModel> page = empleadosRepository.buscar(q, pageable);
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
     * "Jefe" del formulario. Si se pasa excludeId, ese empleado NO aparece
     * (evita que un empleado se asigne como su propio jefe).
     * La regla adicional de filtrado (mismo departamento + CEO)
     * la aplica el frontend.
     */
    public List<EmpleadosModel> getCandidatosJefe(Long excludeId) {
        var estado = com.sistema.empleado.models.EstadoEmpleado.activo;
        if (excludeId != null) {
            return empleadosRepository.findAllByEstadoConCargoExcluyendo(estado, excludeId);
        }
        return empleadosRepository.findAllByEstadoConCargo(estado);
    }

    public EmpleadosModel saveEmpleado(EmpleadoRequestDto dto) {
        // Pre-validación: cédula y email únicos. Lanzamos 409 antes de tocar la BD.
        empleadosRepository.findByCedula(dto.getCedula()).ifPresent(existente -> {
            throw new ConflictException(
                "Ya existe un empleado con la cédula " + dto.getCedula());
        });
        empleadosRepository.findByEmail(dto.getEmail()).ifPresent(existente -> {
            throw new ConflictException(
                "Ya existe un empleado con el email " + dto.getEmail());
        });

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

    private void validarJefeNoEsElMismo(Long empleadoId, Long jefeId) {
        if (jefeId != null && jefeId.equals(empleadoId)) {
            throw new ConflictException(
                "Un empleado no puede ser su propio jefe directo");
        }
    }

    public Optional<EmpleadosModel> updateEmpleado(Long id, EmpleadoRequestDto dto) {
        return empleadosRepository.findById(id).map(existing -> {
            // Cédula: si cambia, validar unicidad contra OTROS empleados.
            if (dto.getCedula() != null && !dto.getCedula().equals(existing.getCedula())) {
                empleadosRepository.findByCedula(dto.getCedula()).ifPresent(otro -> {
                    if (!otro.getId().equals(existing.getId())) {
                        throw new ConflictException(
                            "Ya existe un empleado con la cédula " + dto.getCedula());
                    }
                });
                existing.setCedula(dto.getCedula());
            }
            // Email: idem.
            if (dto.getEmail() != null && !dto.getEmail().equals(existing.getEmail())) {
                empleadosRepository.findByEmail(dto.getEmail()).ifPresent(otro -> {
                    if (!otro.getId().equals(existing.getId())) {
                        throw new ConflictException(
                            "Ya existe un empleado con el email " + dto.getEmail());
                    }
                });
                existing.setEmail(dto.getEmail());
            }
            if (dto.getNombre() != null) existing.setNombre(dto.getNombre());
            if (dto.getApellido() != null) existing.setApellido(dto.getApellido());
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
                // No puede ser su propio jefe
                validarJefeNoEsElMismo(existing.getId(), dto.getJefeId());
                existing.setJefe(
                    empleadosRepository.findById(dto.getJefeId())
                        .orElseThrow(() -> new EntityNotFoundException(
                            "Jefe no encontrado con id " + dto.getJefeId()))
                );
            } else {
                existing.setJefe(null);
            }

            return empleadosRepository.save(existing);
        });
    }
}
