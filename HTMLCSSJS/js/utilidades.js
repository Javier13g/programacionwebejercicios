// ============================================
// js/utilidades.js
// Funciones helper reutilizables (módulo ES6)
// ============================================

const IVA = 0.18;

// Formatea un número a moneda dominicana (RD$) con dos decimales
export const formatearMoneda = (valor) => {
  const numero = Number(valor) || 0;
  return `RD$ ${numero.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Normaliza texto para búsquedas (sin acentos y en minúsculas)
export const normalizarTexto = (texto) => {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Capitaliza la primera letra de cada palabra
export const capitalizar = (texto) => {
  return String(texto)
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
};

// Calcula el IVA sobre un subtotal
export const calcularIVA = (subtotal) => Number(subtotal) * IVA;

// Genera un número aleatorio entero en un rango (inclusivo)
export const aleatorio = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Genera un código de orden con prefijo y padding
export const generarNumeroOrden = (prefijo = "ORD", existente = null) => {
  if (existente !== null) return existente;
  const numero = aleatorio(1, 9999).toString().padStart(4, "0");
  return `${prefijo}-${numero}`;
};

// Convierte un nodo a elemento HTML (atajo)
export const $ = (selector, contexto = document) =>
  contexto.querySelector(selector);

export const $$ = (selector, contexto = document) =>
  Array.from(contexto.querySelectorAll(selector));

// Crea un elemento HTML con atributos y contenido
export const crearElemento = (etiqueta, opciones = {}, hijos = []) => {
  const el = document.createElement(etiqueta);
  Object.entries(opciones).forEach(([key, value]) => {
    if (key === "class") el.className = value;
    else if (key === "text") el.textContent = value;
    else if (key === "html") el.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (typeof value === "boolean") {
      // Solo asignar atributos booleanos si el valor es true
      if (value) el.setAttribute(key, "");
    } else if (value === null || value === undefined) {
      // Omitir atributos con valor nulo
    } else {
      el.setAttribute(key, value);
    }
  });
  hijos.forEach((hijo) => {
    if (hijo instanceof Node) el.appendChild(hijo);
    else if (typeof hijo === "string") el.appendChild(document.createTextNode(hijo));
  });
  return el;
};

// Muestra una notificación flotante (toast)
export const mostrarNotificacion = (mensaje, tipo = "info", duracion = 3000) => {
  try {
    let contenedor = document.getElementById("toast-container");
    if (!contenedor) {
      contenedor = document.createElement("div");
      contenedor.id = "toast-container";
      document.body.appendChild(contenedor);
    }
    const toast = crearElemento(
      "div",
      { class: `toast toast-${tipo}`, role: "status", text: mensaje }
    );
    contenedor.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("toast-salir");
      setTimeout(() => toast.remove(), 300);
    }, duracion);
  } catch (error) {
    console.error("Error al mostrar notificación:", error);
  }
};

// Espera un número de milisegundos (util para async/await)
export const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lee un parámetro de la URL (?q=...&id=...)
export const leerParametroURL = (clave) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(clave);
};

// Debounce: retrasa la ejecución de una función hasta que pase el tiempo indicado
export const debounce = (fn, espera = 300) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), espera);
  };
};

// Persistencia segura en LocalStorage con manejo de errores
export const almacenamiento = {
  guardar(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
      return false;
    }
  },
  leer(clave, defecto = null) {
    try {
      const dato = localStorage.getItem(clave);
      return dato ? JSON.parse(dato) : defecto;
    } catch (error) {
      console.error("Error al leer de localStorage:", error);
      return defecto;
    }
  },
  eliminar(clave) {
    try {
      localStorage.removeItem(clave);
      return true;
    } catch (error) {
      console.error("Error al eliminar de localStorage:", error);
      return false;
    }
  },
  limpiarTodo() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error al limpiar localStorage:", error);
      return false;
    }
  },
};

// Obtiene la fecha/hora actual formateada
export const obtenerFechaHora = () => {
  const ahora = new Date();
  return ahora.toLocaleString("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};