package com.sistema.inventario.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.sistema.inventario.models.RolUsuario;
import com.sistema.inventario.models.UsuariosModel;
import com.sistema.inventario.repositories.IUsuariosRepository;

/**
 * Seeder que crea un usuario ADMIN por defecto al arrancar la app,
 * si todavía no existe.
 *
 * Credenciales por defecto:
 *   username: admin
 *   password: admin123
 *
 * Importante: cambiar la password después del primer login
 * (PATCH /usuarios/{id}/password) o rotando la variable ADMIN_DEFAULT_PASSWORD.
 *
 * Las credenciales se controlan por variables de entorno (en .env):
 *   ADMIN_DEFAULT_USERNAME (default: admin)
 *   ADMIN_DEFAULT_PASSWORD (default: admin123)
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private IUsuariosRepository usuariosRepository;

    // BCrypt encoder local — la clase es thread-safe y stateless
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        // 1) Parametrización por variables de entorno con defaults razonables
        String username = System.getenv().getOrDefault("ADMIN_DEFAULT_USERNAME", "admin");
        String passwordPlano = System.getenv().getOrDefault("ADMIN_DEFAULT_PASSWORD", "admin123");

        // 2) Si ya existe (incluyendo soft-deleted), no hacemos nada
        if (usuariosRepository.findByUsername(username).isPresent()) {
            System.out.println("[DataSeeder] Usuario '" + username + "' ya existe. No se crea.");
            return;
        }

        // 3) Creamos el admin
        UsuariosModel admin = new UsuariosModel();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(passwordPlano)); // BCrypt hash
        admin.setRol(RolUsuario.ADMIN);
        admin.setDeleted(false);
        admin.setDeletedAt(null);

        usuariosRepository.save(admin);

        System.out.println("============================================================");
        System.out.println("[DataSeeder] Usuario ADMIN creado:");
        System.out.println("  username: " + username);
        System.out.println("  password: " + passwordPlano);
        System.out.println("  rol:      ADMIN");
        System.out.println("  IMPORTANTE: cambia la password después del primer login.");
        System.out.println("============================================================");
    }
}