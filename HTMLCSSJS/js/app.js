// ============================================
// js/app.js
// Punto de entrada. Orquesta: modo oscuro,
// dashboard, header, reloj, eventos globales.
// ============================================

import {
  $, $$, crearElemento, formatearMoneda,
  almacenamiento, mostrarNotificacion, obtenerFechaHora,
  debounce, normalizarTexto,
} from "./utilidades.js";

import { cargarProductosLocales, Producto, filtrarProductos, renderizarProductos } from "./productos.js";
import { obtenerCarrito, actualizarContadorCarrito } from "./carrito.js";

// ============================================
// MODO OSCURO (LocalStorage)
// ============================================
const CLAVE_TEMA = "techstore_tema";
export const inicializarModoOscuro = () => {
  const temaGuardado = almacenamiento.leer(CLAVE_TEMA, "claro");
  aplicarTema(temaGuardado);

  // Si existe un botón de tema, le conectamos el evento
  document.addEventListener("click", (e) => {
    if (e.target.matches("#btn-tema, #btn-tema *")) {
      const actual = document.documentElement.getAttribute("data-tema") || "claro";
      aplicarTema(actual === "oscuro" ? "claro" : "oscuro");
    }
  });
};

const aplicarTema = (tema) => {
  document.documentElement.setAttribute("data-tema", tema);
  almacenamiento.guardar(CLAVE_TEMA, tema);
  const btn = document.getElementById("btn-tema");
  if (btn) btn.textContent = tema === "oscuro" ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
};

// ============================================
// RELOJ DIGITAL (setInterval + clearInterval)
// ============================================
export const iniciarReloj = (selector = "#reloj") => {
  const el = document.querySelector(selector);
  if (!el) return null;
  const actualizar = () => { el.textContent = obtenerFechaHora(); };
  actualizar();
  const id = setInterval(actualizar, 1000);
  return () => clearInterval(id);
};

// ============================================
// BANNER ROTATIVO (setTimeout)
// ============================================
const mensajesBanner = [
  "🎧 Hasta 30h de batería en los SoundPro X1",
  "🚚 Envío gratis en compras mayores a RD$ 50,000",
  "💳 12 cuotas sin intereses con tarjetas seleccionadas",
  "🎮 20% OFF en accesorios Gaming esta semana",
];

export const iniciarBannerRotativo = (selector = "#banner-msg") => {
  const el = document.querySelector(selector);
  if (!el) return;
  let i = 0;
  const rotar = () => {
    el.textContent = mensajesBanner[i % mensajesBanner.length];
    i++;
    setTimeout(rotar, 4000);
  };
  rotar();
};

// ============================================
// BÚSQUEDA EN HEADER (input + keyup)
// ============================================
export const inicializarBuscadorHeader = () => {
  const form = document.querySelector('form[role="search"]');
  const input = document.getElementById("buscar-input");
  if (!form || !input) return;

  // Al enviar, redirige a productos.html?q=...
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const termino = input.value.trim();
    window.location.href = termino
      ? `productos.html?q=${encodeURIComponent(termino)}`
      : "productos.html";
  });

  // Sugerencias simples en vivo (autocomplete con datalist)
  input.addEventListener("input", debounce(async (e) => {
    const valor = normalizarTexto(e.target.value);
    if (valor.length < 2) return;
    const productos = await cargarProductosLocales();
    const sugerencias = productos
      .filter((p) => normalizarTexto(p.nombre).includes(valor))
      .slice(0, 5)
      .map((p) => p.nombre);

    let lista = document.getElementById("sugerencias-busqueda");
    if (!lista) {
      lista = crearElemento("datalist", { id: "sugerencias-busqueda" });
      document.body.appendChild(lista);
      input.setAttribute("list", "sugerencias-busqueda");
    }
    lista.innerHTML = "";
    sugerencias.forEach((s) => {
      lista.appendChild(crearElemento("option", { value: s }));
    });
  }, 250));
};

// ============================================
// EVENTOS DE AGREGAR AL CARRITO (delegación)
// ============================================
export const inicializarBotonesAgregar = () => {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-agregar");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const productos = await cargarProductosLocales();
    const producto = productos.find((p) => p.id === id);
    if (producto) obtenerCarrito().agregar(producto, 1);
  });
};

// ============================================
// CONTADOR DEL CARRITO EN HEADER
// ============================================
export const inicializarContadorHeader = () => {
  actualizarContadorCarrito();
  window.addEventListener("carrito:actualizado", () => {
    actualizarContadorCarrito();
  });
};

// ============================================
// OFERTAS TEMPORALES (setInterval)
// ============================================
export const iniciarOfertasTemporales = (selector = "#oferta-timer") => {
  const el = document.querySelector(selector);
  if (!el) return;
  let restante = 600; // 10 minutos en segundos
  const id = setInterval(() => {
    if (restante <= 0) {
      el.textContent = "¡Oferta finalizada!";
      clearInterval(id);
      return;
    }
    const m = String(Math.floor(restante / 60)).padStart(2, "0");
    const s = String(restante % 60).padStart(2, "0");
    el.textContent = `⏰ Oferta termina en ${m}:${s}`;
    restante--;
  }, 1000);
  return id;
};

// ============================================
// DASHBOARD DE ESTADÍSTICAS
// ============================================
export const inicializarDashboard = async (selector = "#dashboard") => {
  const cont = document.querySelector(selector);
  if (!cont) return;
  const productos = await cargarProductosLocales();
  const carrito = obtenerCarrito();

  const totalProductos = productos.length;
  const categorias = [...new Set(productos.map((p) => p.categoria))];
  const masCaro = productos.reduce((a, b) => (a && a.precio > b.precio ? a : b), productos[0] || null);
  const disponibles = productos.filter((p) => !p.agotado).length;
  const resumen = carrito.resumen();

  cont.innerHTML = `
    <h2>Dashboard de Estadísticas</h2>
    <div class="dashboard-grid">
      <article class="stat-card">
        <h3>${totalProductos}</h3>
        <p>Productos totales</p>
      </article>
      <article class="stat-card">
        <h3>${categorias.length}</h3>
        <p>Categorías</p>
      </article>
      <article class="stat-card">
        <h3>${resumen.cantidad}</h3>
        <p>Productos en carrito</p>
      </article>
      <article class="stat-card">
        <h3>${formatearMoneda(resumen.total)}</h3>
        <p>Total acumulado</p>
      </article>
      <article class="stat-card stat-destacado">
        <h3>${masCaro ? formatearMoneda(masco.precio) : "-"}</h3>
        <p>${masCaro ? masCaro.nombre + " (más caro)" : ""}</p>
      </article>
      <article class="stat-card">
        <h3>${disponibles}</h3>
        <p>Productos disponibles</p>
      </article>
    </div>
  `;
};

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  try {
    inicializarModoOscuro();
    inicializarBuscadorHeader();
    inicializarBotonesAgregar();
    inicializarContadorHeader();
    iniciarReloj();
    iniciarBannerRotativo();
    mostrarNotificacion("¡Bienvenido a TechStore Online!", "info", 2500);
  } catch (error) {
    console.error("Error en inicialización global:", error);
    mostrarNotificacion("Ocurrió un error al cargar la página.", "error");
  }
});