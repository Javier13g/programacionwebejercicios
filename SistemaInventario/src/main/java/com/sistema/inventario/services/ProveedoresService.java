package com.sistema.inventario.services;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.dto.ProveedorRequestDto;
import com.sistema.inventario.exceptions.ConflictException;
import com.sistema.inventario.models.ProveedoresModel;
import com.sistema.inventario.repositories.IProveedoresRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ProveedoresService {

    @Autowired
    IProveedoresRepository proveedoresRepository;

    public ProveedoresService(IProveedoresRepository proveedoresRepository) {
        this.proveedoresRepository = proveedoresRepository;
    }

    public PageResponse<ProveedoresModel> getProveedores(String q, Pageable pageable) {
        Page<ProveedoresModel> page = proveedoresRepository.buscar(q, pageable);
        return PageResponse.from(page);
    }

    public ProveedoresModel getProveedorById(Long id) {
        return proveedoresRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Proveedor no encontrado con id " + id));
    }

    public ProveedoresModel saveProveedor(ProveedorRequestDto dto) {
        if (proveedoresRepository.existsByNombreAndDeletedFalse(dto.getNombre())) {
            throw new ConflictException("Ya existe un proveedor activo con el nombre '" + dto.getNombre() + "'");
        }
        ProveedoresModel proveedor = new ProveedoresModel();
        proveedor.setNombre(dto.getNombre());
        proveedor.setTelefono(dto.getTelefono());
        proveedor.setEmail(dto.getEmail());
        proveedor.setDireccion(dto.getDireccion());
        proveedor.setContacto(dto.getContacto());
        return proveedoresRepository.save(proveedor);
    }

    public Optional<ProveedoresModel> updateProveedor(Long id, ProveedorRequestDto dto) {
        return proveedoresRepository.findByIdAndDeletedFalse(id).map(existing -> {
            if (dto.getNombre() != null
                    && !dto.getNombre().equalsIgnoreCase(existing.getNombre())
                    && proveedoresRepository.existsByNombreAndDeletedFalse(dto.getNombre())) {
                throw new ConflictException("Ya existe un proveedor activo con el nombre '" + dto.getNombre() + "'");
            }
            if (dto.getNombre() != null)    existing.setNombre(dto.getNombre());
            if (dto.getTelefono() != null) existing.setTelefono(dto.getTelefono());
            if (dto.getEmail() != null)     existing.setEmail(dto.getEmail());
            if (dto.getDireccion() != null) existing.setDireccion(dto.getDireccion());
            if (dto.getContacto() != null)  existing.setContacto(dto.getContacto());
            return proveedoresRepository.save(existing);
        });
    }

    public boolean cambiarEstado(Long id, boolean delete) {
        Optional<ProveedoresModel> opt = proveedoresRepository.findById(id);
        if (opt.isEmpty()) {
            return false;
        }
        ProveedoresModel proveedor = opt.get();

        if (!delete && proveedor.isDeleted()
                && proveedoresRepository.existsByNombreAndDeletedFalse(proveedor.getNombre())) {
            throw new ConflictException(
                    "No se puede rehabilitar: ya existe un proveedor activo con el nombre '"
                            + proveedor.getNombre() + "'");
        }

        if (proveedor.isDeleted() == delete) {
            return true;
        }

        if (delete) {
            proveedor.setDeleted(true);
            proveedor.setDeletedAt(LocalDateTime.now());
        } else {
            proveedor.setDeleted(false);
            proveedor.setDeletedAt(null);
        }
        proveedoresRepository.save(proveedor);
        return true;
    }
}