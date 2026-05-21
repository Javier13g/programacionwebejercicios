import java.util.Scanner;

public class ejercicio46 {

    public static void main(String[] args) {
        //1. Declarar los tipos de datos
        int a;
        a = 1;

        int x, y;
        x = 2;
        y = 3;
        double x1;
        x1 = 2.5;
        double x2, y2;
        x2 = 3.5;
        y2 = 4.5;
        int a1 = 5,
            b1 = 5,
            c1 = 5;
        boolean sw = false;
        String cad = null;
        final double PI = 3.14;

        System.err.println(a);
        System.err.println(x);
        System.err.println(y);
        System.err.println(x1);
        System.err.println(x2);
        System.err.println(y2);
        System.err.println(a1);
        System.err.println(b1);
        System.err.println(c1);
        System.err.println(sw);
        System.err.println(cad);
        System.err.println(PI);

        //2. Convertir cadena "200" a un entero en la variable E
        String cadena = "200";
        int E = Integer.parseInt(cadena);
        System.out.println("Ejercicio 2: " + E);

        //3. Convertir cadena " 200 " a un entero en la variable E1
        String cadena2 = " 200 ";
        int E1 = Integer.parseInt(cadena2.trim());
        System.out.println("Ejercicio 3: " + E1);

        //4. Convertir cadena "200" a un float en la variable f1
        String cadena3 = "200";
        float f1 = Float.parseFloat(cadena3);
        System.out.println("Ejercicio 4: " + f1);

        //5. Convertir el float 23.84f a una cadena en la variable nomb
        float numero = 23.84f;
        String nomb = String.valueOf(numero);
        System.out.println("Ejercicio 5: " + nomb);

        //6. Defina que es un dato tipo referencia y da 3 ejemplos
        // Ejemplo 1:
        String aa = "Hola";
        String bb = aa;
        System.out.println("Ejercicio 6: " + bb);

        // Ejemplo 2:
        Scanner sc = new Scanner(System.in);

        // Ejemplo 3:
        String nombre = "Ana";
        System.out.println("Ejercicio 6: " + nombre);
    }
}
