public class ejercicio74 {

    public static void main(String[] args) {
        //1. Dados 10 números, se pide calcular la suma y el promedio aritmético
        int[] arrayNums = new int[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        int suma = 0;
        double mediaAritmetica = 0.0;
        int cantidadArray = 0;
        for (int i = 0; i < arrayNums.length; i++) {
            suma += arrayNums[i];
            cantidadArray = arrayNums.length;
        }

        mediaAritmetica = (double) suma / cantidadArray;
        System.out.println("La suma de los elementos es: " + suma);
        System.out.println("La media aritmetica es: " + mediaAritmetica);

        //2. Dados 10 números, se pide obtener en número menor y mayor
        int menor = arrayNums[0];
        int mayor = arrayNums[0];
        for (int i = 1; i < arrayNums.length; i++) {
            if (arrayNums[i] < menor) {
                menor = arrayNums[i];
            }
            if (arrayNums[i] > mayor) {
                mayor = arrayNums[i];
            }
        }
        System.out.println("El número menor es: " + menor);
        System.out.println("El número mayor es: " + mayor);

        //3. Dados 10 números y un divisor, se pide hallar los múltiplos del divisor en cada número ingresado.
        //
        int divisor = 2;
        for (int i = 0; i < arrayNums.length; i++) {
            if (arrayNums[i] % divisor == 0) {
                System.out.println(
                    "El número " + arrayNums[i] + " es múltiplo de " + divisor
                );
            }
        }

        // 4. Ubique un número dado en un arreglo de 10 números ingresados con anterioridad, reporte también su posesión en el arreglo
        int numeroDado = 5;
        for (int i = 0; i < arrayNums.length; i++) {
            if (arrayNums[i] == numeroDado) {
                System.out.println(
                    "El número " +
                        numeroDado +
                        " se encuentra en la posición " +
                        i
                );
            }
        }

        //5. Ingrese dos matrices de orden 3 x 3 y calcule:
        //• Su producto de cada matriz por un número dado
        //• la suma de las dos matrices
        //• el producto de las dos matrices
        //
        int[][] matriz1 = new int[][] { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 } };
        int[][] matriz2 = new int[][] { { 1, 2, 2 }, { 4, 5, 6 }, { 5, 8, 7 } };
        int numero = 2;

        // Producto de cada matriz por un número dado
        System.out.println("--- Matriz1 multiplicada por " + numero + " ---");
        for (int i = 0; i < matriz1.length; i++) {
            for (int j = 0; j < matriz1[i].length; j++) {
                System.out.print((matriz1[i][j] * numero) + " ");
            }
            System.out.println();
        }
        System.out.println("--- Matriz2 multiplicada por " + numero + " ---");
        for (int i = 0; i < matriz2.length; i++) {
            for (int j = 0; j < matriz2[i].length; j++) {
                System.out.print((matriz2[i][j] * numero) + " ");
            }
            System.out.println();
        }

        // Suma de las dos matrices
        System.out.println("--- Suma de matriz1 y matriz2 ---");
        for (int i = 0; i < matriz1.length; i++) {
            for (int j = 0; j < matriz1[i].length; j++) {
                System.out.print((matriz1[i][j] + matriz2[i][j]) + " ");
            }
            System.out.println();
        }

        // Producto de las dos matrices (Fila x Columna)
        System.out.println("--- Producto de matriz1 y matriz2 ---");
        for (int i = 0; i < matriz1.length; i++) {
            for (int j = 0; j < matriz1[i].length; j++) {
                int sumaProducto = 0;
                for (int k = 0; k < matriz2.length; k++) {
                    sumaProducto += matriz1[i][k] * matriz2[k][j];
                }
                System.out.print(sumaProducto + " ");
            }
            System.out.println();
        }
    }
}
