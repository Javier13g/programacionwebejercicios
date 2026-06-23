// ============================================
// js/validaciones.js
// Expresiones regulares y validadores del formulario
// ============================================

// Expresiones regulares
export const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefono: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}[\]:;"'<>,.?/~`|\\]{8,}$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,60}$/,
  soloNumeros: /^[0-9]+$/,
};

// Validadores individuales (retornan { valido, mensaje })
export const validarCampo = {
  nombre(valor) {
    const limpio = String(valor || "").trim();
    if (!limpio) return { valido: false, mensaje: "El nombre es obligatorio." };
    if (!regex.nombre.test(limpio))
      return { valido: false, mensaje: "El nombre solo puede contener letras (mín. 2)." };
    return { valido: true, mensaje: "Nombre válido." };
  },

  email(valor) {
    const limpio = String(valor || "").trim();
    if (!limpio) return { valido: false, mensaje: "El correo es obligatorio." };
    if (!regex.email.test(limpio))
      return { valido: false, mensaje: "Formato de correo inválido (ej: usuario@dominio.com)." };
    return { valido: true, mensaje: "Correo válido." };
  },

  telefono(valor) {
    const limpio = String(valor || "").trim();
    if (!limpio) return { valido: false, mensaje: "El teléfono es obligatorio." };
    if (!regex.telefono.test(limpio))
      return { valido: false, mensaje: "Formato inválido. Use 809-555-5555." };
    return { valido: true, mensaje: "Teléfono válido." };
  },

  password(valor) {
    const limpio = String(valor || "");
    if (!limpio) return { valido: false, mensaje: "La contraseña es obligatoria." };
    if (limpio.length < 8)
      return { valido: false, mensaje: "La contraseña debe tener al menos 8 caracteres." };
    if (!regex.password.test(limpio))
      return {
        valido: false,
        mensaje: "Debe incluir letras y números (mínimo 8 caracteres).",
      };
    return { valido: true, mensaje: "Contraseña segura." };
  },

  mensaje(valor) {
    const limpio = String(valor || "").trim();
    if (limpio.length < 10)
      return { valido: false, mensaje: "El mensaje debe tener al menos 10 caracteres." };
    return { valido: true, mensaje: "Mensaje válido." };
  },

  url(valor) {
    const limpio = String(valor || "").trim();
    if (limpio && !regex.url.test(limpio))
      return { valido: false, mensaje: "URL inválida. Debe comenzar con http:// o https://" };
    return { valido: true, mensaje: "" };
  },
};

// Aplica el resultado de validación a un campo mostrando mensajes dinámicos
export const mostrarEstadoCampo = (input, resultado) => {
  const grupo = input.closest("p") || input.parentElement;
  if (!grupo) return;
  let msg = grupo.querySelector(".mensaje-validacion");
  if (!msg) {
    msg = document.createElement("span");
    msg.className = "mensaje-validacion";
    grupo.appendChild(msg);
  }
  input.classList.remove("valido", "invalido");
  msg.classList.remove("valido", "invalido");

  if (resultado.valido) {
    input.classList.add("valido");
    msg.classList.add("valido");
    msg.textContent = resultado.mensaje;
  } else {
    input.classList.add("invalido");
    msg.classList.add("invalido");
    msg.textContent = resultado.mensaje;
  }
};

// Valida todo el formulario de contacto y devuelve si es válido
export const validarFormularioContacto = (form) => {
  let esValido = true;
  const campos = {
    nombre: form.querySelector("#id-nombre"),
    correo: form.querySelector("#id-correo"),
    clave: form.querySelector("#id-clave"),
    telefono: form.querySelector("#id-tel"),
    url: form.querySelector("#id-url"),
    texto: form.querySelector("#id-texto"),
  };

  const chequeos = [
    validarCampo.nombre(campos.nombre?.value),
    validarCampo.email(campos.correo?.value),
    validarCampo.password(campos.clave?.value),
    validarCampo.telefono(campos.tel?.value),
    validarCampo.url(campos.url?.value),
    validarCampo.mensaje(campos.texto?.value),
  ];

  chequeos.forEach((r, i) => {
    const refs = [campos.nombre, campos.correo, campos.clave, campos.telefono, campos.url, campos.texto];
    if (refs[i]) mostrarEstadoCampo(refs[i], r);
    if (!r.valido) esValido = false;
  });

  return esValido;
};