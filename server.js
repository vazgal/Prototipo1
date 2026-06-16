// ============================================================
//  INVENTARIOFERR · server.js
//  Backend en Node.js + Express + MySQL2
//  Para activar: cambia CONFIG.MODO_DEMO = false en app.js
// ============================================================

const express = require('express');
const mysql   = require('mysql2/promise');
const path    = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── CONEXIÓN A BASE DE DATOS ──────────────────────────────────
const DB_CONFIG = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '',
  database: process.env.DB_NAME     || 'ferreteria',
  waitForConnections: true,
  connectionLimit:    10,
};

let pool;

async function conectarBD() {
  try {
    pool = mysql.createPool(DB_CONFIG);
    // Verificar conexión
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ Conectado a MySQL:', DB_CONFIG.database);
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
    console.log('   Asegúrate de que MySQL esté corriendo y las credenciales sean correctas.');
    process.exit(1);
  }
}

// ── RUTAS DE LA API ───────────────────────────────────────────

// GET /api/categorias
app.get('/api/categorias', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
      ORDER BY p.nombre
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/productos
app.post('/api/productos', async (req, res) => {
  try {
    const { codigo, nombre, descripcion, categoria_id, precio_compra,
            precio_venta, cantidad, stock_minimo, unidad } = req.body;

    const [result] = await pool.query(`
      INSERT INTO productos
        (codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, cantidad, stock_minimo, unidad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, cantidad, stock_minimo || 5, unidad || 'pieza']);

    res.json({ id: result.insertId, message: 'Producto creado correctamente.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El código del producto ya existe.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/productos/:id
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { codigo, nombre, descripcion, categoria_id, precio_compra,
            precio_venta, cantidad, stock_minimo, unidad } = req.body;

    await pool.query(`
      UPDATE productos SET
        codigo = ?, nombre = ?, descripcion = ?, categoria_id = ?,
        precio_compra = ?, precio_venta = ?, cantidad = ?,
        stock_minimo = ?, unidad = ?
      WHERE id = ?
    `, [codigo, nombre, descripcion, categoria_id, precio_compra,
        precio_venta, cantidad, stock_minimo, unidad, req.params.id]);

    res.json({ message: 'Producto actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/productos/:id (soft delete)
app.delete('/api/productos/:id', async (req, res) => {
  try {
    await pool.query('UPDATE productos SET activo = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto dado de baja correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/movimientos
app.get('/api/movimientos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, p.nombre AS producto_nombre
      FROM movimientos m
      LEFT JOIN productos p ON m.producto_id = p.id
      ORDER BY m.creado_en DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/movimientos (también actualiza el stock)
app.post('/api/movimientos', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { producto_id, tipo, cantidad, cantidad_antes, cantidad_despues, motivo } = req.body;

    // Actualizar stock del producto
    await conn.query(
      'UPDATE productos SET cantidad = ? WHERE id = ?',
      [cantidad_despues, producto_id]
    );

    // Registrar movimiento
    const [result] = await conn.query(`
      INSERT INTO movimientos
        (producto_id, tipo, cantidad, cantidad_antes, cantidad_despues, motivo)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [producto_id, tipo, cantidad, cantidad_antes, cantidad_despues, motivo]);

    await conn.commit();
    res.json({ id: result.insertId, message: 'Movimiento registrado.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ── CATCH-ALL: sirve el index.html para SPA ───────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── INICIAR SERVIDOR ──────────────────────────────────────────
async function iniciar() {
  await conectarBD();
  app.listen(PORT, () => {
    console.log(`🔩 InventarioFerr corriendo en http://localhost:${PORT}`);
  });
}

iniciar();
