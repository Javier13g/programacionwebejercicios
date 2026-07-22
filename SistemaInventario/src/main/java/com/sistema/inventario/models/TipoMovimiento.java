package com.sistema.inventario.models;

/**
 * Tipos de movimiento de stock.
 *  - ENTRADA : suma al stock (compra, devolución de cliente, ajuste +).
 *  - SALIDA  : resta del stock (venta, merma, ajuste -).
 *  - AJUSTE  : corrige el stock a un valor absoluto (el service reemplaza
 *              stockActual por la cantidad indicada).
 */
public enum TipoMovimiento {
    ENTRADA,
    SALIDA,
    AJUSTE
}
