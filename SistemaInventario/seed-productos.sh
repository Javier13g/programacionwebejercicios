#!/usr/bin/env bash
set -e

TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzaXN0ZW1hLWludmVudGFyaW8iLCJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbCI6IkFETUlOIiwiaWF0IjoxNzg0NzQwNzEzLCJleHAiOjE3ODQ3NDQzMTN9.JAnSnuyUbkPgAqN1X4Qz8VnW5zkEvXG5aZaJAAuLH30"
BASE="http://localhost:8080/productos"

crear() {
  local sku="$1"
  local body="$2"
  echo "Creando $sku..."
  local code
  code=$(curl -s -o /tmp/resp.json -w "%{http_code}" -X POST "$BASE" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$body")
  if [ "$code" = "201" ]; then
    local id
    id=$(grep -o '"id":[0-9]*' /tmp/resp.json | head -1)
    echo "  OK -> $id (HTTP $code)"
  else
    echo "  ERROR (HTTP $code):"
    cat /tmp/resp.json
    echo ""
  fi
}

crear "BEB-COCA-1500" '{
  "sku":"BEB-COCA-1500","nombre":"Coca-Cola 1.5L","descripcion":"Botella retornable",
  "precioCompra":800,"precioVenta":1500,"stockActual":50,"stockMinimo":10,
  "categoriaId":4,"proveedorId":1
}'

crear "BEB-AGUA-500" '{
  "sku":"BEB-AGUA-500","nombre":"Agua Mineral 500ml","descripcion":"Sin gas",
  "precioCompra":150,"precioVenta":300,"stockActual":200,"stockMinimo":50,
  "categoriaId":4,"proveedorId":1
}'

crear "BEB-CERV-330" '{
  "sku":"BEB-CERV-330","nombre":"Cerveza Quilmes 330ml","descripcion":"Lata",
  "precioCompra":400,"precioVenta":800,"stockActual":5,"stockMinimo":24,
  "categoriaId":4,"proveedorId":2
}'

crear "ELE-LG-TVP-55" '{
  "sku":"ELE-LG-TVP-55","nombre":"Smart TV LG 55\"","descripcion":"4K UHD WebOS",
  "precioCompra":350000,"precioVenta":499999,"stockActual":8,"stockMinimo":2,
  "categoriaId":1,"proveedorId":3
}'

crear "ELE-JBL-AUD-01" '{
  "sku":"ELE-JBL-AUD-01","nombre":"Auriculares JBL Tune 510BT","descripcion":"Bluetooth, negros",
  "precioCompra":18000,"precioVenta":29999,"stockActual":25,"stockMinimo":5,
  "categoriaId":1,"proveedorId":3
}'

crear "HER-BOS-TAL-12" '{
  "sku":"HER-BOS-TAL-12","nombre":"Taladro Bosch 12mm","descripcion":"Percutor, 600W",
  "precioCompra":45000,"precioVenta":72999,"stockActual":3,"stockMinimo":4,
  "categoriaId":8,"proveedorId":2
}'

crear "HER-STN-MART-01" '{
  "sku":"HER-STN-MART-01","nombre":"Martillo Stanley 16oz","descripcion":"Mango de fibra",
  "precioCompra":8000,"precioVenta":14500,"stockActual":30,"stockMinimo":5,
  "categoriaId":8,"proveedorId":2
}'

crear "HOC-MOU-SP-01" '{
  "sku":"HOC-MOU-SP-01","nombre":"Mouse Logitech M100","descripcion":"USB, óptico",
  "precioCompra":3500,"precioVenta":6500,"stockActual":60,"stockMinimo":15,
  "categoriaId":9,"proveedorId":3
}'

crear "HOC-CAR-SILLA-01" '{
  "sku":"HOC-CAR-SILLA-01","nombre":"Silla de oficina ergonómica","descripcion":"Con apoyabrazos",
  "precioCompra":75000,"precioVenta":119999,"stockActual":4,"stockMinimo":3,
  "categoriaId":9,"proveedorId":2
}'

crear "ROP-REM-NEG-M" '{
  "sku":"ROP-REM-NEG-M","nombre":"Remera algodon negra talle M","descripcion":"100% algodon",
  "precioCompra":4500,"precioVenta":9990,"stockActual":40,"stockMinimo":10,
  "categoriaId":3,"proveedorId":1
}'

echo ""
echo "============================================================"
echo "Listo. Verificando con GET /productos..."
echo "============================================================"
curl -s "http://localhost:8080/productos?size=50" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"totalElements":[0-9]*'