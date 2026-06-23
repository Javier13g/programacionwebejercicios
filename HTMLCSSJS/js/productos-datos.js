// ============================================
// js/productos-datos.js
// Datos embebidos como fallback (cuando fetch falla
// por CORS al abrir con file://)
// ============================================

export const PRODUCTOS_LOCALES = [
  {
    id: 1,
    nombre: "Smartphone Galaxy A54 5G",
    marca: "Samsung",
    categoria: "smartphones",
    precio: 409.90,
    stock: 12,
    disponible: true,
    oferta: 0,
    imagen: "img/galaxy-a54.svg",
    descripcion: "Pantalla Super AMOLED y conectividad movil de alta velocidad."
  },
  {
    id: 2,
    nombre: "Laptop Lenovo IdeaPad 3",
    marca: "Lenovo",
    categoria: "laptops",
    precio: 599.99,
    stock: 4,
    disponible: true,
    oferta: 0,
    imagen: "img/lenovo-ideapad.svg",
    descripcion: "Procesador eficiente, ideal para estudios y trabajo remoto."
  },
  {
    id: 3,
    nombre: "Auriculares Sony WH-CH720N",
    marca: "Sony",
    categoria: "audio",
    precio: 199.90,
    stock: 18,
    disponible: true,
    oferta: 20,
    imagen: "img/sony-ch720n.svg",
    descripcion: "Cancelacion de ruido activa y almohadillas comodas."
  },
  {
    id: 4,
    nombre: "Smartwatch Xiaomi Watch 2",
    marca: "Xiaomi",
    categoria: "accesorios",
    precio: 159.90,
    stock: 9,
    disponible: true,
    oferta: 0,
    imagen: "img/xiaomi-watch2.svg",
    descripcion: "Monitoreo avanzado de salud, ritmo cardiaco y sueno profundo."
  },
  {
    id: 5,
    nombre: "Control Xbox Series X/S",
    marca: "Microsoft",
    categoria: "gaming",
    precio: 74.90,
    stock: 0,
    disponible: false,
    oferta: 0,
    imagen: "img/control-xbox.svg",
    descripcion: "Diseno ergonomico texturizado y compatibilidad multiplataforma."
  },
  {
    id: 6,
    nombre: "Echo Dot 5ta Gen",
    marca: "Amazon",
    categoria: "accesorios",
    precio: 49.99,
    stock: 25,
    disponible: true,
    oferta: 0,
    imagen: "img/echo-dot5.svg",
    descripcion: "Bocina inteligente equipada con el asistente de voz Alexa."
  },
  {
    id: 7,
    nombre: "Teclado Mecanico RGB",
    marca: "Logitech",
    categoria: "accesorios",
    precio: 89.90,
    stock: 14,
    disponible: true,
    oferta: 10,
    imagen: "img/teclado-rgb.svg",
    descripcion: "Interruptores tactiles de alta durabilidad."
  },
  {
    id: 8,
    nombre: "Mouse Ergonomico Inalambrico",
    marca: "Logitech",
    categoria: "accesorios",
    precio: 35.00,
    stock: 30,
    disponible: true,
    oferta: 0,
    imagen: "img/mouse-wireless.svg",
    descripcion: "Precision optica superior y diseno para cuidar tu muneca."
  },
  {
    id: 9,
    nombre: "Auriculares Inalambricos SoundPro X1",
    marca: "Sony",
    categoria: "audio",
    precio: 249.90,
    stock: 7,
    disponible: true,
    oferta: 0,
    imagen: "img/auriculares-banner.svg",
    descripcion: "Sonido premium, cancelacion de ruido y 30 horas de bateria."
  },
  {
    id: 10,
    nombre: "MacBook Air M2",
    marca: "Apple",
    categoria: "laptops",
    precio: 1199.00,
    stock: 5,
    disponible: true,
    oferta: 0,
    imagen: "img/producto-default.jpg",
    descripcion: "Chip M2, 8 GB de RAM unificada y pantalla Liquid Retina de 13.6 pulgadas."
  },
  {
    id: 11,
    nombre: "iPhone 15 Pro",
    marca: "Apple",
    categoria: "smartphones",
    precio: 1299.00,
    stock: 3,
    disponible: true,
    oferta: 5,
    imagen: "img/producto-default.jpg",
    descripcion: "Chip A17 Pro, cuerpo de titanio y camara periscopio de 5x."
  },
  {
    id: 12,
    nombre: "PlayStation 5 Slim",
    marca: "Sony",
    categoria: "gaming",
    precio: 549.00,
    stock: 2,
    disponible: true,
    oferta: 0,
    imagen: "img/producto-default.jpg",
    descripcion: "Consola de nueva generacion con SSD ultra rapido y soporte 4K."
  },
  {
    id: 13,
    nombre: "Monitor Curvo 27 pulgadas 144Hz",
    marca: "Samsung",
    categoria: "accesorios",
    precio: 289.90,
    stock: 11,
    disponible: true,
    oferta: 15,
    imagen: "img/producto-default.jpg",
    descripcion: "Panel VA curvo 1500R, 1ms de respuesta y FreeSync Premium."
  },
  {
    id: 14,
    nombre: "Tablet Galaxy Tab S9",
    marca: "Samsung",
    categoria: "smartphones",
    precio: 799.00,
    stock: 6,
    disponible: true,
    oferta: 0,
    imagen: "img/producto-default.jpg",
    descripcion: "Pantalla Dynamic AMOLED 2X de 11 pulgadas y S Pen incluido."
  },
  {
    id: 15,
    nombre: "Bocina JBL Flip 6",
    marca: "JBL",
    categoria: "audio",
    precio: 129.90,
    stock: 20,
    disponible: true,
    oferta: 0,
    imagen: "img/producto-default.jpg",
    descripcion: "Sonido potente, resistente al agua IP67 y 12 horas de bateria."
  },
  {
    id: 16,
    nombre: "Webcam Logitech C920",
    marca: "Logitech",
    categoria: "accesorios",
    precio: 79.90,
    stock: 16,
    disponible: true,
    oferta: 0,
    imagen: "img/producto-default.jpg",
    descripcion: "Full HD 1080p, microfono estereo y correccion automatica de luz."
  }
];