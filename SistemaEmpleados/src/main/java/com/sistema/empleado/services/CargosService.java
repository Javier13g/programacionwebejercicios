package com.sistema.empleado.services;

import java.lang.reflect.Field;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sistema.empleado.dto.CargoRequestDto;
import com.sistema.empleado.dto.PageResponse;
import com.sistema.empleado.models.CargosModel;
import com.sistema.empleado.models.NivelCargo;
import com.sistema.empleado.repositories.ICargosRepository;

@Service
public class CargosService {

     @Autowired
    ICargosRepository cargosRepository;

    public PageResponse<CargosModel> getCargos(String q, NivelCargo nivel, Pageable pageable) {
        Page<CargosModel> page = cargosRepository.buscar(q, nivel, pageable);
        return PageResponse.from(page);
    }

    public CargosModel getCargoById(Long id) {
        return cargosRepository.findById(id).orElse(null);
    }

    public CargosModel saveCargo(CargoRequestDto dto) {
        CargosModel cargo = new CargosModel();
        cargo.setNombre(dto.getNombre());
        cargo.setNivel(dto.getNivel());
        cargo.setSalarioBase(dto.getSalarioBase());
        return cargosRepository.save(cargo);
    }

    public Optional<CargosModel> updateCargo(Long id, CargosModel cargo) {
        return cargosRepository.findById(id).map(existingCargo -> {
            copyNonNullProperties(cargo, existingCargo);
            return cargosRepository.save(existingCargo);
        });
    }

     private void copyNonNullProperties(Object source, Object target) {
        Field[] fields = source.getClass().getDeclaredFields();
        for (Field field : fields) {
            try {
                field.setAccessible(true);
                Object value = field.get(source);
                if (value != null) {
                    field.set(target, value);
                }
            } catch (IllegalAccessException e) {
                throw new RuntimeException(
                    "No se pudo copiar el campo: " + field.getName(), e);
            }
        }
    }

}
