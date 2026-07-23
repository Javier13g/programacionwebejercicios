package com.sistema.inventario;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InventarioApplication {

	public static void main(String[] args) {
		// Carga las variables definidas en el archivo .env en el entorno del sistema
		// antes de inicializar el contexto de Spring, de modo que ${...} en
		// application.properties pueda resolverlas.
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();
		dotenv.entries().forEach(entry -> {
			if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
				System.setProperty(entry.getKey(), entry.getValue());
			}
		});

		SpringApplication.run(InventarioApplication.class, args);
	}

}
