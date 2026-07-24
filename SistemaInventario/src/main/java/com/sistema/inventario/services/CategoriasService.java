package com.sistema.inventario.services;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sistema.inventario.dto.CategoriaRequestDto;
import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.exceptions.ConflictException;
import com.sistema.inventario.models.CategoriasModel;
import com.sistema.inventario.repositories.ICategoriasRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class CategoriasService {

    @Autowired
    ICategoriasRepository categoriasRepository;

    public PageResponse<CategoriasModel> getCategorias(String q, Pageable pageable) {
        Page<CategoriasModel> page = categoriasRepository.buscar(q, pageable);
        return PageResponse.from(page);
    }

    public CategoriasModel getCategoriaById(Long id) {
        return categoriasRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Categoria no encontrada con id " + id));
    }

    public CategoriasModel saveCategoria(CategoriaRequestDto dto) {
        if (categoriasRepository.existsByNombreAndDeletedFalse(dto.getNombre())) {
            throw new ConflictException("Ya existe una categoria activa con el nombre '" + dto.getNombre() + "'");
        }
        CategoriasModel categoria = new CategoriasModel();
        categoria.setNombre(dto.getNombre());
        categoria.setDescripcion(dto.getDescripcion());
        return categoriasRepository.save(categoria);
    }

    public Optional<CategoriasModel> updateCategoria(Long id, CategoriaRequestDto dto) {
        return categoriasRepository.findByIdAndDeletedFalse(id).map(existing -> {
            if (dto.getNombre() != null
                    && !dto.getNombre().equalsIgnoreCase(existing.getNombre())
                    && categoriasRepository.existsByNombreAndDeletedFalse(dto.getNombre())) {
                throw new ConflictException("Ya existe una categoria activa con el nombre '" + dto.getNombre() + "'");
            }
            if (dto.getNombre() != null)      existing.setNombre(dto.getNombre());
            if (dto.getDescripcion() != null) existing.setDescripcion(dto.getDescripcion());
            return categoriasRepository.save(existing);
        });
    }


    public boolean cambiarEstado(Long id, boolean delete) {
        Optional<CategoriasModel> opt = categoriasRepository.findById(id);
        if (opt.isEmpty()) {
            return false;
        }
        CategoriasModel categoria = opt.get();

        if (!delete && categoria.isDeleted()
                && categoriasRepository.existsByNombreAndDeletedFalse(categoria.getNombre())) {
            throw new ConflictException(
                    "No se puede rehabilitar: ya existe una categoria activa con el nombre '"
                            + categoria.getNombre() + "'");
        }

        if (categoria.isDeleted() == delete) {
            return true;
        }

        if (delete) {
            categoria.setDeleted(true);
            categoria.setDeletedAt(LocalDateTime.now());
        } else {
            categoria.setDeleted(false);
            categoria.setDeletedAt(null);
        }
        categoriasRepository.save(categoria);
        return true;
    }

    }