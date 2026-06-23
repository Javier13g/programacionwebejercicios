// ============================================
// js/productos.js
// Clase Producto, Cliente y renderizado de catálogo
// ============================================

import { $, $$, crearElemento, formatearMoneda, capitalizar } from "./utilidades.js";

// --------------------------------------------
// Clase Producto (POO con encapsulación básica)
// --------------------------------------------
export class Producto {
  #id;
  #nombre;
  #precio;
  #stock;
  #categoria;
  #marca;
  #oferta;
  #imagen;
  #descripcion;
  #disponible;

  constructor({
    id,
    nombre,
    precio,
    stock = 0,
    categoria = "general",
    marca = "Genérica",
    oferta = 0,
    imagen = "img/producto-default.jpg",
    descripcion = "",
    disponible = true,
  }) {
    this.#id = id;
    this.#nombre = nombre;
    this.#precio = Number(precio);
    this.#stock = Number(stock);
    this.#categoria = categoria;
    this.#marca = marca;
    this.#oferta = Number(oferta) || 0;
    this.#imagen = imagen;
    this.#descripcion = descripcion;
    this.#disponible = disponible;
  }

  get id() { return this.#id; }
  get nombre() { return this.#nombre; }
  get precio() { return this.#precio; }
  get precioOriginal() { return this.#precio; }
  get stock() { return this.#stock; }
  get categoria() { return this.#categoria; }
  get marca() { return this.#marca; }
  get oferta() { return this.#oferta; }
  get imagen() { return this.#imagen; }
  get descripcion() { return this.#descripcion; }
  get disponible() { return this.#disponible; }

  get precioConDescuento() {
    if (this.#oferta <= 0) return this.#precio;
    return Number((this.#precio * (1 - this.#oferta / 100)).toFixed(2));
  }

  get tieneOferta() { return this.#oferta > 0; }
  get agotado() { return this.#stock <= 0 || !this.#disponible; }
  get estado() { return this.agotado ? "Agotado" : (this.#stock <= 5 ? "Pocas unidades" : "Disponible"); }

  toJSON() {
    return {
      id: this.#id,
      nombre: this.#nombre,
      precio: this.#precio,
      stock: this.#stock,
      categoria: this.#categoria,
      marca: this.#marca,
      oferta: this.#oferta,
      imagen: this.#imagen,
      descripcion: this.#descripcion,
      disponible: this.#disponible,
    };
  }

  static desdeJSON(obj) {
    return new Producto(obj);
  }
}

// --------------------------------------------
// Clase Cliente
// --------------------------------------------
export class Cliente {
  #nombre;
  #email;
  #telefono;

  constructor(nombre = "", email = "", telefono = "") {
    this.#nombre = nombre;
    this.#email = email;
    this.#telefono = telefono;
  }

  get nombre() { return this.#nombre; }
  get email() { return this.#email; }
  get telefono() { return this.#telefono; }

  set nombre(v) { this.#nombre = v; }
  set email(v) { this.#email = v; }
  set telefono(v) { this.#telefono = v; }
}

// --------------------------------------------
// Renderizado de tarjetas (generación dinámica del DOM)
// --------------------------------------------
export const crearTarjetaProducto = (producto) => {
  const disponible = !producto.agotado;
  const precioFinal = producto.precioConDescuento;
  const precioHTML = producto.tieneOferta
    ? `<p class="precio-anterior">${formatearMoneda(producto.precioOriginal)}</p>
       <p class="precio"><strong>${formatearMoneda(precioFinal)}</strong></p>
       <p class="oferta-tag"><mark>${producto.oferta}% OFF</mark></p>`
    : `<p class="precio"><strong>${formatearMoneda(precioFinal)}</strong></p>`;

  const article = crearElemento("article", { class: "producto" });

  const header = crearElemento("header");
  const h3 = crearElemento("h3", { text: producto.nombre });
  header.appendChild(h3);
  article.appendChild(header);

  const img = crearElemento("img", {
    src: producto.imagen,
    alt: producto.nombre,
    loading: "lazy",
  });
  article.appendChild(img);

  const desc = crearElemento("p", { text: producto.descripcion });
  article.appendChild(desc);

  const footer = crearElemento("footer");
  footer.innerHTML = `
    <p>Categoría: <span>${capitalizar(producto.categoria)}</span></p>
    <p>Marca: <span>${producto.marca}</span></p>
    ${precioHTML}
    <p>Disponibilidad: <mark class="${disponible ? "disponible" : "agotado"}">${producto.estado}</mark></p>
  `;

  const btnDetalle = crearElemento("a", { href: `producto.html?id=${producto.id}` });
  btnDetalle.appendChild(crearElemento("button", { type: "button", text: "Ver detalles" }));
  footer.appendChild(btnDetalle);

  const btnAgregar = crearElemento("button", {
    type: "button",
    class: "btn-agregar",
    "data-id": producto.id,
    text: disponible ? "Agregar al carrito" : "Agotado",
    disabled: !disponible,
  });
  footer.appendChild(btnAgregar);

  article.appendChild(footer);
  return article;
};

// Renderiza una lista de productos en un contenedor
export const renderizarProductos = (lista, contenedor) => {
  if (!contenedor) return;
  contenedor.innerHTML = "";
  if (lista.length === 0) {
    const vacio = crearElemento("p", {
      class: "sin-resultados",
      text: "No se encontraron productos que coincidan con la búsqueda.",
    });
    contenedor.appendChild(vacio);
    return;
  }
  lista.forEach((prod) => {
    contenedor.appendChild(crearTarjetaProducto(prod));
  });
};

// --------------------------------------------
// Filtros y búsqueda
// --------------------------------------------
export const filtrarProductos = (lista, criterios = {}) => {
  return lista.filter((p) => {
    if (criterios.texto) {
      const t = criterios.texto.toLowerCase();
      const cumple =
        p.nombre.toLowerCase().includes(t) ||
        p.categoria.toLowerCase().includes(t) ||
        p.marca.toLowerCase().includes(t);
      if (!cumple) return false;
    }
    if (criterios.categoria && criterios.categoria !== "") {
      if (p.categoria !== criterios.categoria) return false;
    }
    if (typeof criterios.precioMax === "number" && criterios.precioMax > 0) {
      if (p.precioConDescuento > criterios.precioMax) return false;
    }
    if (criterios.soloDisponibles) {
      if (p.agotado) return false;
    }
    return true;
  });
};


export const cargarProductosLocales = async () => {
  try {
    const resp = await fetch("data/productos.json");
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const data = await resp.json();
    return data.map((p) => Producto.desdeJSON(p));
  } catch (error) {
    console.error("Error al cargar productos locales:", error);
  }
};

export const obtenerProductoPorId = (lista, id) => {
  return lista.find((p) => p.id === Number(id));
};