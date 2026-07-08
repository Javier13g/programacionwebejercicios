import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acerca',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main>
      <section id="historia-organizacion">
        <article>
          <h2>Nuestra misión gamer</h2>
          <blockquote>
            "Conectar a los jugadores con los mejores títulos del mercado,
            ofreciendo una experiencia de compra ágil, segura y divertida."
            <cite>-- Declaración del Equipo GameStore,
              <time datetime="2026-01-15">15 de Enero de 2026</time>
            </cite>
          </blockquote>
          <p>
            Somos una tienda de videojuegos construida con
            <abbr title="Angular 18">Angular</abbr> y la API pública de
            <abbr title="RAWG Video Games Database">RAWG</abbr>.
          </p>
          <details>
            <summary>Preguntas frecuentes</summary>
            <p>Los precios son referenciales en pesos dominicanos (RD$). Las ofertas y el stock se simulan para fines demostrativos.</p>
          </details>
        </article>
      </section>
      <section id="preferencias">
        <h2>Preferencias</h2>
        <article>
          <h3>Modo de visualización</h3>
          <p>Cambia entre modo claro y oscuro usando el botón en la cabecera.</p>
        </article>
      </section>
    </main>
  `,
})
export class AcercaComponent {}
