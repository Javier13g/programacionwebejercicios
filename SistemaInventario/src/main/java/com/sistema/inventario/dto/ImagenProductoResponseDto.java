package com.sistema.inventario.dto;

/**
 * Respuesta al subir una imagen a Imgur.
 * La URL publica es la que el cliente (Angular) mostrara.
 * El deleteHash lo guardamos internamente para poder borrar la imagen despues.
 */
public class ImagenProductoResponseDto {

    private String imageUrl;        // URL publica (https://i.imgur.com/XXXX.jpg)
    private String imageDeleteHash; // hash para borrar en Imgur
    private Integer width;
    private Integer height;
    private Long size;              // bytes

    public ImagenProductoResponseDto() {
    }

    public ImagenProductoResponseDto(String imageUrl, String imageDeleteHash,
                                     Integer width, Integer height, Long size) {
        this.imageUrl = imageUrl;
        this.imageDeleteHash = imageDeleteHash;
        this.width = width;
        this.height = height;
        this.size = size;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageDeleteHash() {
        return imageDeleteHash;
    }

    public void setImageDeleteHash(String imageDeleteHash) {
        this.imageDeleteHash = imageDeleteHash;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }
}