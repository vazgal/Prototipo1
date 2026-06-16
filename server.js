const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());

// Esto le dice al servidor que muestre tu diseño web de la carpeta 'public'
app.use(express.static(path.join(__blank, 'public')));

// --- DIAGNÓSTICO DE VARIABLES ---
// Esto aparecerá en los logs de Railway para confirmar si está leyendo la base de datos
console.log("=== INICIANDO SERVIDOR ===");
console.log("Host de BD detectado:", process.env.MYSQLHOST || "NINGUNO - Usando red local");
console.log("Puerto de BD detectado:", process.env.MYSQLPORT || "3306");
console.log("Usuario de BD detectado:", process.env.MYSQLUSER || "root");

// --- CONEXIÓN A LA BASE DE DATOS ---
const pool = mysql.createPool({
    host: process.env.MYSQLHOST || '127.0.0.1',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'ferreteria',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Prueba de conexión inmediata para que Railway nos avise si funcionó
pool.getConnection()
    .then(conn => {
        console.log("✅ ¡ÉXITO! Conectado a la base de datos MySQL en la nube.");
        conn.release();
    })
    .catch(err => {
        console.error("❌ ERROR FATAL de conexión a MySQL:", err.message);
    });

// --- RUTAS DE LA APLICACIÓN ---

// Ruta para obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventario');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para agregar un nuevo producto
app.post('/api/productos', async (req, res) => {
    const { codigo, nombre, categoria, precio_compra, precio_venta, cantidad } = req.body;
    
    try {
        const [result] = await pool.query(
            'INSERT INTO inventario (codigo, nombre, categoria, precio_compra, precio_venta, cantidad) VALUES (?, ?, ?, ?, ?, ?)',
            [codigo, nombre, categoria, precio_compra, precio_venta, cantidad]
        );
        res.json({ mensaje: 'Producto guardado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al guardar el producto:', error);
        res.status(500).json({ error: 'Error al guardar en la base de datos' });
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor web activo y escuchando en el puerto ${PORT}`);
});
