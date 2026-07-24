package com.sistema.inventario.controllers;

import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sistema.inventario.dto.ApiError;
import com.sistema.inventario.dto.ImagenProductoResponseDto;
import com.sistema.inventario.dto.PageResponse;
import com.sistema.inventario.dto.ProductoEstadoDto;
import com.sistema.inventario.dto.ProductoPatchDto;
import com.sistema.inventario.dto.ProductoRequestDto;
import com.sistema.inventario.exceptions.ImageUploadException;
import com.sistema.inventario.models.ProductosModel;
import com.sistema.inventario.repositories.IProductosRepository;
import com.sistema.inventario.services.ImgurService;
import com.sistema.inventario.services.ProductosService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/productos")
public class ProductosController {

    private final ProductosService productosService;
    private final ImgurService imgurService;
    private final IProductosRepository productosRepository;

    public ProductosController(ProductosService productosService,
            ImgurService imgurService,
            IProductosRepository productosRepository) {
        this.productosService = productosService;
        this.imgurService = imgurService;
        this.productosRepository = productosRepository;
    }

    @GetMapping
    public PageResponse<ProductosModel> getProductos(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long proveedorId,
            @RequestParam(required = false) Boolean stockBajo,
            Pageable pageable) {
        return productosService.getProductos(q, categoriaId, proveedorId, stockBajo, pageable);
    }

    @GetMapping("/{id}")
    public ProductosModel getProductoById(@PathVariable Long id) {
        return productosService.getProductoById(id);
    }

    @PostMapping
    public ResponseEntity<ProductosModel> saveProducto(
            @Valid @RequestBody ProductoRequestDto producto) {
        ProductosModel saved = productosService.saveProducto(producto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductosModel> updateProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoPatchDto dto) {
        return productosService.updateProducto(id, dto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ProductoEstadoDto dto,
            jakarta.servlet.http.HttpServletRequest request) {

        if (dto.getDeleted() == null) {
            ApiError error = new ApiError(
                    400, "Bad Request",
                    "El campo 'deleted' es obligatorio", request.getRequestURI());
            return ResponseEntity.badRequest().body(error);
        }

        return productosService.cambiarEstado(id, dto.getDeleted())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }


    @PostMapping(value = "/{id}/imagen", consumes = "multipart/form-data")
    @Transactional
    public ResponseEntity<?> subirImagen(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            jakarta.servlet.http.HttpServletRequest request) {

        if (file == null || file.isEmpty()) {
            ApiError error = new ApiError(400, "Bad Request",
                    "El archivo 'file' es obligatorio", request.getRequestURI());
            return ResponseEntity.badRequest().body(error);
        }

        ProductosModel producto = productosRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Producto no encontrado con id " + id));
        String hashAnterior = producto.getImageDeleteHash();

        try {
            String base64 = java.util.Base64.getEncoder().encodeToString(file.getBytes());
            String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
            ImagenProductoResponseDto img = imgurService.uploadImage(base64, contentType);

            producto.setImageUrl(img.getImageUrl());
            producto.setImageDeleteHash(img.getImageDeleteHash());
            productosRepository.save(producto);
            if (hashAnterior != null && !hashAnterior.isBlank()) {
                try {
                    imgurService.deleteImage(hashAnterior);
                } catch (Exception ignored) {
                }
            }

            return ResponseEntity.ok(img);

        } catch (ImageUploadException e) {
            ApiError error = new ApiError(502, "Bad Gateway",
                    "Error al subir imagen a Imgur: " + e.getMessage(),
                    request.getRequestURI());
            return ResponseEntity.status(502).body(error);
        } catch (Exception e) {
            ApiError error = new ApiError(500, "Internal Server Error",
                    "Error inesperado: " + e.getMessage(),
                    request.getRequestURI());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/{id}/imagen/base64")
    @Transactional
    public ResponseEntity<?> subirImagenBase64(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            jakarta.servlet.http.HttpServletRequest request) {

        String image = body != null ? body.get("image") : null;
        String mimeType = body != null ? body.get("mimeType") : null;

        if (image == null || image.isBlank()) {
            ApiError error = new ApiError(400, "Bad Request",
                    "El campo 'image' es obligatorio", request.getRequestURI());
            return ResponseEntity.badRequest().body(error);
        }

        ProductosModel producto = productosRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Producto no encontrado con id " + id));

        String hashAnterior = producto.getImageDeleteHash();

        try {
            String base64Limpio = ImgurService.decodeBase64Image(image);
            ImagenProductoResponseDto img = imgurService.uploadImage(base64Limpio, mimeType);

            producto.setImageUrl(img.getImageUrl());
            producto.setImageDeleteHash(img.getImageDeleteHash());
            productosRepository.save(producto);

            if (hashAnterior != null && !hashAnterior.isBlank()) {
                try {
                    imgurService.deleteImage(hashAnterior);
                } catch (Exception ignored) {
                }
            }

            return ResponseEntity.ok(img);

        } catch (ImageUploadException e) {
            ApiError error = new ApiError(502, "Bad Gateway",
                    "Error al subir imagen a Imgur: " + e.getMessage(),
                    request.getRequestURI());
            return ResponseEntity.status(502).body(error);
        }
    }

    @DeleteMapping("/{id}/imagen")
    @Transactional
    public ResponseEntity<?> borrarImagen(
            @PathVariable Long id,
            jakarta.servlet.http.HttpServletRequest request) {

        ProductosModel producto = productosRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Producto no encontrado con id " + id));

        if (producto.getImageDeleteHash() == null || producto.getImageDeleteHash().isBlank()) {
            ApiError error = new ApiError(404, "Not Found",
                    "El producto no tiene imagen", request.getRequestURI());
            return ResponseEntity.status(404).body(error);
        }

        try {
            imgurService.deleteImage(producto.getImageDeleteHash());
            producto.setImageUrl(null);
            producto.setImageDeleteHash(null);
            productosRepository.save(producto);
            return ResponseEntity.noContent().build();
        } catch (ImageUploadException e) {
            producto.setImageUrl(null);
            producto.setImageDeleteHash(null);
            productosRepository.save(producto);
            ApiError error = new ApiError(502, "Bad Gateway",
                    "Imagen borrada localmente pero fallo en Imgur: " + e.getMessage(),
                    request.getRequestURI());
            return ResponseEntity.status(502).body(error);
        }
    }
}