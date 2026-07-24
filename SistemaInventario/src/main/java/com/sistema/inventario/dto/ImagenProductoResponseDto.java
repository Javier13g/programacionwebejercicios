package com.sistema.inventario.dto;

public class ImagenProductoResponseDto {

    private String imageUrl;
    private String imageDeleteHash;
    private Integer width;
    private Integer height;
    private Long size;

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