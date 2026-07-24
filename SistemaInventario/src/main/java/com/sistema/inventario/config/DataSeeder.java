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
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private IUsuariosRepository usuariosRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataSeeder(IUsuariosRepository usuariosRepository) {
        this.usuariosRepository = usuariosRepository;
    }

    @Override
    public void run(String... args) {
        String username = System.getenv().getOrDefault("ADMIN_DEFAULT_USERNAME", "admin");
        String passwordPlano = System.getenv().getOrDefault("ADMIN_DEFAULT_PASSWORD", "admin123");

        if (usuariosRepository.findByUsername(username).isPresent()) {
            System.out.println("[DataSeeder] Usuario '" + username + "' ya existe. No se crea.");
            return;
        }

        UsuariosModel admin = new UsuariosModel();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(passwordPlano));
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