// ============================================
// js/api.js
// Consumo de APIs REST con Fetch + async/await
// ============================================

import { mostrarNotificacion } from "./utilidades.js";

// URL base de la FakeStore API
const FAKE_STORE_BASE = "https://fakestoreapi.com";

// Obtiene productos desde la FakeStore API (con try/catch/finally)
export const obtenerProductosAPI = async () => {
  try {
    const respuesta = await fetch(`${FAKE_STORE_BASE}/products`);
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("Fallo al consultar la API:", error);
    mostrarNotificacion("No se pudo conectar con la API externa.", "error");
    return [];
  } finally {
    console.log("Consulta de API finalizada.");
  }
};

// Obtiene un solo producto por id
export const obtenerProductoAPI = async (id) => {
  try {
    const respuesta = await fetch(`${FAKE_STORE_BASE}/products/${id}`);
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
    return await respuesta.json();
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return null;
  } finally {
    console.log(`Consulta del producto ${id} finalizada.`);
  }
};

// Obtiene todas las categorías
export const obtenerCategoriasAPI = async () => {
  try {
    const respuesta = await fetch(`${FAKE_STORE_BASE}/products/categories`);
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
    return await respuesta.json();
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return [];
  }
};

// Combina productos locales con los de la API (modo demostración)
export const combinarConAPI = async (productosLocales) => {
  const productosAPI = await obtenerProductosAPI();
  return productosAPI.map((p) => ({
    id: `api-${p.id}`,
    nombre: p.title,
    precio: p.price,
    categoria: p.category,
    marca: "API Store",
    stock: 10,
    disponible: true,
    oferta: 0,
    imagen: p.image,
    descripcion: p.description,
  })).concat(productosLocales.map((p) => p.toJSON()));
};