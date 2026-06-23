// ============================================
// js/carrito.js
// Clase Carrito con persistencia en LocalStorage
// ============================================

import { almacenamiento, formatearMoneda, calcularIVA, mostrarNotificacion, aleatorio } from "./utilidades.js";

const CLAVE_STORAGE = "techstore_carrito";

export class Carrito {
  #items;
  #fecha;

  constructor() {
    this.#items = almacenamiento.leer(CLAVE_STORAGE, []);
    this.#fecha = new Date().toISOString();
  }

  get items() { return [...this.#items]; }
  get cantidad() { return this.#items.reduce((s, i) => s + i.cantidad, 0); }
  get subtotal() {
    return Number(this.#items.reduce((s, i) => s + i.precio * i.cantidad, 0).toFixed(2));
  }
  get impuestos() { return Number(calcularIVA(this.subtotal).toFixed(2)); }
  get total() { return Number((this.subtotal + this.impuestos).toFixed(2)); }
  get vacio() { return this.#items.length === 0; }

  #persistir() {
    almacenamiento.guardar(CLAVE_STORAGE, this.#items);
    this.#fecha = new Date().toISOString();
    window.dispatchEvent(new CustomEvent("carrito:actualizado", { detail: this.resumen() }));
  }

  agregar(producto, cantidad = 1) {
    if (!producto || producto.agotado) {
      mostrarNotificacion("Producto no disponible.", "error");
      return false;
    }
    const existente = this.#items.find((i) => i.id === producto.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.#items.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precioConDescuento,
        imagen: producto.imagen,
        cantidad,
      });
    }
    this.#persistir();
    mostrarNotificacion(`${producto.nombre} agregado al carrito.`, "success");
    return true;
  }

  eliminar(id) {
    const idx = this.#items.findIndex((i) => i.id === Number(id));
    if (idx === -1) return false;
    const eliminado = this.#items.splice(idx, 1);
    this.#persistir();
    if (eliminado[0]) mostrarNotificacion(`${eliminado[0].nombre} eliminado.`, "info");
    return true;
  }

  actualizarCantidad(id, cantidad) {
    const item = this.#items.find((i) => i.id === Number(id));
    if (!item) return false;
    if (cantidad <= 0) return this.eliminar(id);
    item.cantidad = Number(cantidad);
    this.#persistir();
    return true;
  }

  vaciar() {
    if (this.#items.length === 0) return;
    this.#items = [];
    this.#persistir();
    mostrarNotificacion("Carrito vaciado.", "info");
  }

  resumen() {
    return {
      cantidad: this.cantidad,
      subtotal: this.subtotal,
      impuestos: this.impuestos,
      total: this.total,
      vacio: this.vacio,
    };
  }

  finalizarCompra() {
    if (this.vacio) {
      mostrarNotificacion("El carrito está vacío.", "error");
      return null;
    }
    const orden = {
      numero: `ORD-${aleatorio(1000, 9999)}`,
      fecha: new Date().toLocaleString("es-DO"),
      items: this.items,
      subtotal: this.subtotal,
      impuestos: this.impuestos,
      total: this.total,
    };
    // Guardar última orden y vaciar
    almacenamiento.guardar("techstore_ultima_orden", orden);
    this.#items = [];
    this.#persistir();
    return orden;
  }
}

// Instancia singleton del carrito
let _instancia = null;
export const obtenerCarrito = () => {
  if (!_instancia) _instancia = new Carrito();
  return _instancia;
};

// Actualiza el contador visual del carrito en el header
export const actualizarContadorCarrito = () => {
  const carrito = obtenerCarrito();
  const contadores = document.querySelectorAll("[data-carrito-contador]");
  contadores.forEach((el) => {
    el.textContent = `(${carrito.cantidad})`;
    el.style.display = carrito.cantidad > 0 ? "inline" : "none";
  });
};

// Render dinámico del carrito en la página carrito.html
export const renderizarCarrito = (contenedor) => {
  const carrito = obtenerCarrito();
  if (!contenedor) return;

  if (carrito.vacio) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <p>🛒 Tu carrito está vacío.</p>
        <a href="productos.html"><button type="button">Ir a Productos</button></a>
      </div>
    `;
    return;
  }

  const filas = carrito.items.map((item) => `
    <tr data-id="${item.id}">
      <td><img src="${item.imagen}" alt="${item.nombre}" class="carrito-img"></td>
      <td>${item.nombre}</td>
      <td>
        <input type="number" class="input-cantidad" data-id="${item.id}" value="${item.cantidad}" min="1" max="99">
      </td>
      <td>${formatearMoneda(item.precio)}</td>
      <td>${formatearMoneda(item.precio * item.cantidad)}</td>
      <td><button class="btn-eliminar" data-id="${item.id}">Eliminar</button></td>
    </tr>
  `).join("");

  contenedor.innerHTML = `
    <table class="tabla-carrito">
      <caption>Resumen de Compra Actual</caption>
      <thead>
        <tr>
          <th colspan="2">Producto</th>
          <th>Cantidad</th>
          <th>Precio unitario</th>
          <th>Subtotal</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
      <tfoot>
        <tr><td colspan="4">Subtotal</td><td colspan="2">${formatearMoneda(carrito.subtotal)}</td></tr>
        <tr><td colspan="4">ITBIS (18%)</td><td colspan="2">${formatearMoneda(carrito.impuestos)}</td></tr>
        <tr class="total-row"><td colspan="4"><strong>TOTAL</strong></td><td colspan="2"><strong>${formatearMoneda(carrito.total)}</strong></td></tr>
      </tfoot>
    </table>
    <div class="carrito-acciones">
      <button id="btn-vaciar" type="button">Vaciar carrito</button>
      <button id="btn-finalizar" type="button">Finalizar compra</button>
    </div>
    <article id="confirmacion-compra"></article>
  `;
};