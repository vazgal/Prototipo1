# 🔩 InventarioFerr — Sistema de Inventario para Ferretería

Sistema CRUD completo para gestionar el inventario de una ferretería local.
Incluye dashboard, búsqueda en tiempo real, control de stock y exportación a Excel.

---

## 📁 Estructura del Proyecto

```
ferreteria/
├── public/
│   ├── index.html      ← Toda la interfaz (una sola página)
│   ├── styles.css      ← Estilos (sin dependencias externas)
│   └── app.js          ← Lógica JS del cliente
├── server.js           ← Backend Node.js + Express (solo para modo producción)
├── database.sql        ← Script para crear las tablas en MySQL/PostgreSQL
├── package.json
├── .env.example        ← Plantilla de variables de entorno
└── README.md
```

---

## 🚀 Opción A — Modo DEMO (sin servidor, recomendado para empezar)

No necesitas instalar nada. Los datos se guardan en el navegador (localStorage).

```bash
# 1. Abre directamente el archivo:
open public/index.html

# O sirve la carpeta con cualquier servidor estático:
npx serve public -p 3000
# Luego abre: http://localhost:3000
```

✅ Funciona sin base de datos ni Node.js.
⚠️  Los datos se borran si limpias el caché del navegador.

---

## 🔌 Opción B — Modo PRODUCCIÓN con MySQL

### 1. Preparar la base de datos

```bash
# Crear la base de datos
mysql -u root -p -e "CREATE DATABASE ferreteria CHARACTER SET utf8mb4;"

# Ejecutar el script de tablas y datos demo
mysql -u root -p ferreteria < database.sql
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales de MySQL
```

### 3. Instalar dependencias y arrancar

```bash
npm install
npm start           # Producción
# o
npm run dev         # Desarrollo con recarga automática (requiere nodemon)
```

Abre: **http://localhost:3000**

### 4. Activar el modo producción en el frontend

En `public/app.js`, cambia la línea:
```js
MODO_DEMO: true,   // ← cambia a false
```

---

## ☁️ Despliegue en producción

### Railway (recomendado — gratis con BD incluida)

1. Crea cuenta en [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Agrega un servicio MySQL desde el dashboard de Railway
4. Copia las variables de entorno (DB_HOST, DB_USER, etc.) al proyecto
5. Sube el repositorio. Railway detecta `package.json` y hace el deploy automático.

### Render.com (alternativa gratuita)

1. Conecta tu repositorio en [render.com](https://render.com)
2. Tipo: **Web Service**, Build: `npm install`, Start: `node server.js`
3. Agrega las variables de entorno en el panel
4. Para la BD puedes usar [PlanetScale](https://planetscale.com) (MySQL serverless gratis)

### Vercel (solo frontend estático)

Para Vercel **sin servidor**, usa el modo DEMO (sin base de datos):
```bash
# Instala Vercel CLI
npm i -g vercel

# Desde la carpeta public/
cd public && vercel
```
Los datos se guardan en localStorage del visitante.

---

## 🗄️ PostgreSQL en lugar de MySQL

El script `database.sql` incluye notas de conversión. Los cambios principales son:

```sql
-- MySQL:       INT AUTO_INCREMENT PRIMARY KEY
-- PostgreSQL:  SERIAL PRIMARY KEY

-- MySQL:       ENUM('entrada', 'salida', 'ajuste')
-- PostgreSQL:  VARCHAR(10) CHECK (tipo IN ('entrada', 'salida', 'ajuste'))

-- MySQL:       ON UPDATE CURRENT_TIMESTAMP
-- PostgreSQL:  usar un trigger (ver notas al final del .sql)
```

En `server.js`, reemplaza `mysql2` por `pg`:
```bash
npm uninstall mysql2
npm install pg
```

---

## ✨ Funcionalidades incluidas

| Módulo           | Detalle                                                         |
|------------------|-----------------------------------------------------------------|
| Dashboard        | KPIs en tiempo real, alertas de stock bajo, resumen categorías  |
| Búsqueda         | Filtra por código o nombre mientras escribes (tiempo real)      |
| Inventario CRUD  | Crear, editar, ver y eliminar productos                         |
| Ajuste de stock  | Entrada/salida rápida con registro de motivo y bitácora         |
| Stock bajo       | Vista dedicada con botón directo de reabastecimiento            |
| Movimientos      | Historial completo de entradas y salidas                        |
| Exportar Excel   | Descarga CSV con BOM (acentos correctos en Excel)               |
| Responsive       | Funciona en celular y computadora                               |

---

## 🛠️ Personalización rápida

**Cambiar moneda:** En `app.js` busca `currency: 'MXN'` y cambia al código ISO de tu país.

**Cambiar stock mínimo default:** En `app.js`, `CONFIG.STOCK_MINIMO_DEFAULT = 5`.

**Agregar categorías:** En el archivo `database.sql`, agrega filas al INSERT de `categorias`. En modo demo, edita `CATEGORIAS_DEMO` en `app.js`.

---

## 📋 Requisitos técnicos

- **Modo demo:** Solo un navegador moderno (Chrome, Firefox, Edge, Safari)
- **Modo producción:** Node.js 18+, MySQL 8+ o PostgreSQL 13+
