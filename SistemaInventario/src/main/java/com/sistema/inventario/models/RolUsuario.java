package com.sistema.inventario.models;

/**
 * Roles del sistema.
 *  - ADMIN     : puede crear/editar/eliminar productos, categorías,
 *                proveedores y usuarios.
 *  - OPERADOR  : puede registrar movimientos (entradas/salidas) y
 *                consultar el inventario, pero no modificar catálogos.
 */
public enum RolUsuario {
    ADMIN,
    OPERADOR
}
