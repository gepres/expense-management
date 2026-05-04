# 📊 Categorías y Subcategorías - Sistema de Gastos

Versión: 1.0.0
Última actualización: 2025-11-15

---

## 📋 Categorías Principales

### 1. 🍔 Alimentación (`alimentacion`)

**Descripción:** Gastos relacionados con comida y bebidas
**Color:** #FF6B6B

**Subcategorías:**

| ID | Nombre | Descripción |
|---|---|---|
| `supermercado` | Supermercado | Compras de abarrotes y productos básicos |
| `restaurantes` | Restaurantes | Comidas fuera de casa |
| `delivery` | Delivery | Pedidos a domicilio |
| `cafe_snacks` | Café y Snacks | Cafeterías, bocaditos y meriendas |
| `bebidas` | Bebidas | Bebidas alcohólicas y no alcohólicas |

---

### 2. 🚗 Transporte (`transporte`)

**Descripción:** Gastos de movilidad y transporte
**Color:** #4ECDC4

**Subcategorías:**

| ID | Nombre | Descripción |
|---|---|---|
| `combustible` | Combustible | Gasolina, diesel, GNV |
| `taxi_uber` | Taxi/Uber | Servicios de taxi y aplicativos |
| `transporte_publico` | Transporte Público | Bus, metro, tren |
| `estacionamiento` | Estacionamiento | Parqueos y cocheras |
| `mantenimiento_vehiculo` | Mantenimiento de Vehículo | Revisiones, reparaciones, llantas |
| `peajes` | Peajes | Peajes y vías de pago |

---

### 3. 🎮 Entretenimiento (`entretenimiento`)

**Descripción:** Ocio y actividades recreativas
**Color:** #95E1D3

**Subcategorías:**

| ID | Nombre | Descripción |
|---|---|---|
| `cine_teatro` | Cine y Teatro | Entradas a cine, teatro, conciertos |
| `streaming` | Streaming | Netflix, Spotify, Disney+, etc. |
| `videojuegos` | Videojuegos | Juegos, consolas, suscripciones |
| `deportes` | Deportes | Gimnasio, actividades deportivas |
| `hobbies` | Hobbies | Pasatiempos y aficiones |
| `viajes` | Viajes | Turismo y vacaciones |

---

### 4. 💊 Salud (`salud`)

**Descripción:** Gastos médicos y de bienestar
**Color:** #F38181

**Subcategorías:**

| ID | Nombre | Descripción |
|---|---|---|
| `medicinas` | Medicinas | Farmacia y medicamentos |
| `consultas_medicas` | Consultas Médicas | Doctores, especialistas |
| `examenes` | Exámenes | Análisis y estudios médicos |
| `dental` | Dental | Odontología y tratamientos dentales |
| `vision` | Visión | Oftalmología, lentes |
| `terapias` | Terapias | Psicología, fisioterapia, etc. |
| `seguro_medico` | Seguro Médico | Pólizas y seguros de salud |

---

### 5. 💡 Servicios (`servicios`)

**Descripción:** Servicios básicos y suscripciones
**Color:** #FEE140

**Subcategorías:**

| ID | Nombre | Descripción |
|---|---|---|
| `luz` | Luz | Electricidad |
| `agua` | Agua | Servicio de agua potable |
| `gas` | Gas | Gas natural o balón |
| `internet` | Internet | Internet y cable |
| `telefono` | Teléfono | Plan móvil y telefonía |
| `limpieza` | Limpieza | Servicio de limpieza del hogar |
| `seguridad` | Seguridad | Alarmas, vigilancia |
| `otros_servicios` | Otros Servicios | Servicios diversos |

---

### 6. 🛍️ Compras (`compras`)

**Descripción:** Compras personales y del hogar
**Color:** #AA96DA

**Subcategorías:**

| ID | Nombre | Descripción |
|---|---|---|
| `ropa` | Ropa | Vestimenta y calzado |
| `electronica` | Electrónica | Gadgets, computadoras, teléfonos |
| `muebles` | Muebles | Mobiliario y decoración |
| `electrodomesticos` | Electrodomésticos | Aparatos del hogar |
| `mascotas` | Mascotas | Comida y cuidados de mascotas |
| `cuidado_personal` | Cuidado Personal | Higiene, cosmética, peluquería |
| `regalos` | Regalos | Obsequios y celebraciones |

---

### 7. 📚 Educación (`educacion`)

**Descripción:** Gastos educativos y de formación
**Color:** #FCBAD3

**Subcategorías:**

| ID | Nombre | Descripción |
|---|---|---|
| `colegiatura` | Colegiatura | Pensiones escolares o universitarias |
| `libros` | Libros | Libros y material de estudio |
| `cursos` | Cursos | Cursos y talleres |
| `utiles` | Útiles | Material escolar y de oficina |
| `uniformes` | Uniformes | Uniformes escolares |
| `plataformas_educativas` | Plataformas Educativas | Udemy, Coursera, etc. |

---

### 8. 🏠 Vivienda (`vivienda`)

**Descripción:** Gastos relacionados con el hogar
**Color:** #FFFFD2

**Subcategorías:**

| ID | Nombre | Descripción |
|---|---|---|
| `alquiler` | Alquiler | Renta mensual |
| `hipoteca` | Hipoteca | Cuota hipotecaria |
| `mantenimiento` | Mantenimiento | Reparaciones y mantenimiento del hogar |
| `impuestos_vivienda` | Impuestos | Impuesto predial y otros |
| `seguro_hogar` | Seguro de Hogar | Póliza de seguro del hogar |
| `mejoras_hogar` | Mejoras | Renovaciones y mejoras |

---

### 9. 📦 Otros (`otros`)

**Descripción:** Gastos diversos no clasificados
**Color:** #A8DADC

**Subcategorías:**

| ID | Nombre | Descripción |
|---|---|---|
| `impuestos` | Impuestos | Impuestos diversos |
| `multas` | Multas | Multas y penalidades |
| `donaciones` | Donaciones | Caridad y donaciones |
| `cuotas_asociaciones` | Cuotas y Asociaciones | Membresías y cuotas |
| `legales` | Servicios Legales | Abogados, notarías |
| `bancarios` | Servicios Bancarios | Comisiones y cargos bancarios |
| `varios` | Varios | Gastos misceláneos |

---

## 💰 Categoría Especial: Presupuesto General

**ID:** `general`
**Nombre:** Presupuesto General
**Icono:** 💰
**Color:** #5d6672
**Descripción:** Presupuesto general del mes (ingresos)

Esta categoría especial se usa para registrar el presupuesto total disponible del mes. Se pueden crear múltiples presupuestos generales por mes, y el sistema los sumará para calcular el límite total.

---

## 💳 Métodos de Pago

| ID | Nombre | Icono | Descripción |
|---|---|---|---|
| `efectivo` | Efectivo | 💵 | Pago en dinero físico |
| `tarjeta_debito` | Tarjeta de Débito | 💳 | Pago con tarjeta de débito |
| `tarjeta_credito` | Tarjeta de Crédito | 💳 | Pago con tarjeta de crédito |
| `transferencia` | Transferencia | 🏦 | Transferencia bancaria |
| `yape` | Yape | 📱 | Pago con Yape (Perú) |
| `plin` | Plin | 📱 | Pago con Plin (Perú) |
| `otros` | Otros | 💰 | Otros métodos de pago |

---

## 💱 Monedas Soportadas

| ID | Nombre | Símbolo | Icono | Código ISO |
|---|---|---|---|---|
| `PEN` | Soles Peruanos | S/ | 🇵🇪 | PEN |
| `USD` | Dólares Estadounidenses | $ | 🇺🇸 | USD |

---

## 📊 Estadísticas

- **Total de categorías:** 9
- **Total de subcategorías:** 57
- **Métodos de pago:** 7
- **Monedas:** 2

---

## 🔧 Uso en el Backend

### Estructura de Base de Datos

Puedes importar el archivo `categorias.json` directamente en tu base de datos o usarlo como referencia para crear las tablas/colecciones.

### Ejemplo de Importación (Node.js)

```javascript
const categorias = require('./categorias.json');

// Importar a MongoDB
await db.collection('categorias').insertMany(categorias.categorias);
await db.collection('metodos_pago').insertMany(categorias.metodosPago);
await db.collection('monedas').insertMany(categorias.monedas);

// O importar a Firestore
categorias.categorias.forEach(async (categoria) => {
  await db.collection('categorias').doc(categoria.id).set(categoria);
});
```

### Endpoints Sugeridos

```
GET  /api/categorias              - Listar todas las categorías
GET  /api/categorias/:id          - Obtener una categoría específica
GET  /api/categorias/:id/subcategorias - Listar subcategorías
GET  /api/metodos-pago            - Listar métodos de pago
GET  /api/monedas                 - Listar monedas soportadas
```

---

## 📝 Notas

1. **IDs únicos:** Todos los IDs son únicos y en snake_case
2. **Subcategorías opcionales:** Los gastos pueden o no tener subcategoría
3. **Extensible:** Puedes agregar más categorías/subcategorías según necesites
4. **Colores:** Los colores son sugerencias para la UI
5. **Iconos:** Los emojis son sugerencias, puedes usar iconos de librerías como FontAwesome

---

## 🔄 Historial de Versiones

### v1.0.0 (2025-11-15)
- ✅ Definición inicial de 9 categorías principales
- ✅ 57 subcategorías distribuidas
- ✅ 7 métodos de pago (incluye Yape y Plin para Perú)
- ✅ 2 monedas (PEN y USD)
- ✅ Categoría especial "Presupuesto General"

---

## 🆘 Soporte

Si necesitas agregar nuevas categorías o modificar las existentes, edita el archivo `categorias.json` y actualiza la versión.
