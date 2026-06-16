-- ============================================================
--  SISTEMA DE INVENTARIO - FERRETERÍA
--  Compatible con MySQL 8+ y PostgreSQL 13+
--  Autor: Sistema generado automáticamente
-- ============================================================

-- ──────────────────────────────────────────────
--  1. CATEGORÍAS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
    id          INT AUTO_INCREMENT PRIMARY KEY,   -- PostgreSQL: SERIAL PRIMARY KEY
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de categorías
INSERT INTO categorias (nombre) VALUES
    ('Plomería'),
    ('Electricidad'),
    ('Herramientas'),
    ('Pintura'),
    ('Construcción'),
    ('Fijaciones'),
    ('Jardinería'),
    ('Seguridad'),
    ('General');

-- ──────────────────────────────────────────────
--  2. PRODUCTOS (tabla principal)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
    id              INT AUTO_INCREMENT PRIMARY KEY,  -- PostgreSQL: SERIAL PRIMARY KEY
    codigo          VARCHAR(50)     NOT NULL UNIQUE,
    nombre          VARCHAR(200)    NOT NULL,
    descripcion     TEXT,
    categoria_id    INT             NOT NULL,
    precio_compra   DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    precio_venta    DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    cantidad        INT             NOT NULL DEFAULT 0,
    stock_minimo    INT             NOT NULL DEFAULT 5,   -- Umbral de alerta de stock bajo
    unidad          VARCHAR(30)     DEFAULT 'pieza',      -- pieza, metro, litro, kg, etc.
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON DELETE RESTRICT
);

-- Índices para búsqueda rápida
CREATE INDEX idx_productos_codigo  ON productos(codigo);
CREATE INDEX idx_productos_nombre  ON productos(nombre);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo  ON productos(activo);

-- ──────────────────────────────────────────────
--  3. MOVIMIENTOS DE INVENTARIO (bitácora)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS movimientos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    producto_id     INT             NOT NULL,
    tipo            ENUM('entrada', 'salida', 'ajuste') NOT NULL,  
    -- PostgreSQL: tipo VARCHAR(10) CHECK (tipo IN ('entrada','salida','ajuste'))
    cantidad        INT             NOT NULL,
    cantidad_antes  INT             NOT NULL,
    cantidad_despues INT            NOT NULL,
    motivo          VARCHAR(255),
    usuario         VARCHAR(100)    DEFAULT 'admin',
    creado_en       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimiento_producto FOREIGN KEY (producto_id)
        REFERENCES productos(id) ON DELETE CASCADE
);

CREATE INDEX idx_movimientos_producto  ON movimientos(producto_id);
CREATE INDEX idx_movimientos_fecha     ON movimientos(creado_en);

-- ──────────────────────────────────────────────
--  4. DATOS DE EJEMPLO (ferretería típica)
-- ──────────────────────────────────────────────
INSERT INTO productos (codigo, nombre, categoria_id, precio_compra, precio_venta, cantidad, stock_minimo, unidad) VALUES
    ('PLO-001', 'Codo de cobre 1/2"',         1,  8.50,  15.00,  45,  5, 'pieza'),
    ('PLO-002', 'Tubo galvanizado 1" x 6m',   1, 85.00, 150.00,  12,  3, 'pieza'),
    ('PLO-003', 'Llave de paso 3/4"',          1, 45.00,  80.00,   8,  5, 'pieza'),
    ('PLO-004', 'Cinta teflón 3/4"',           1,  3.50,   8.00, 120, 10, 'rollo'),
    ('PLO-005', 'Tee de cobre 1/2"',           1,  9.00,  16.00,   3,  5, 'pieza'),
    ('ELE-001', 'Cable THW calibre 12 (100m)', 2,180.00, 320.00,   6,  2, 'rollo'),
    ('ELE-002', 'Contacto doble polarizado',   2, 18.00,  35.00,  50,  8, 'pieza'),
    ('ELE-003', 'Interruptor sencillo',         2, 12.00,  25.00,  40, 10, 'pieza'),
    ('ELE-004', 'Foco LED 9W E27',             2, 22.00,  42.00,  35,  8, 'pieza'),
    ('ELE-005', 'Clavija 2P+T 15A',            2,  8.00,  18.00,   4,  5, 'pieza'),
    ('HER-001', 'Desarmador plano 6"',          3, 15.00,  30.00,  25,  5, 'pieza'),
    ('HER-002', 'Pinza de presión 10"',         3, 45.00,  90.00,  15,  3, 'pieza'),
    ('HER-003', 'Martillo uña 16 oz',           3, 55.00, 110.00,  10,  3, 'pieza'),
    ('HER-004', 'Cinta métrica 5m',             3, 28.00,  55.00,  20,  5, 'pieza'),
    ('PIN-001', 'Pintura vinílica blanca 4L',   4, 85.00, 155.00,  18,  4, 'cubeta'),
    ('PIN-002', 'Rodillo de 9" para pintura',   4, 18.00,  38.00,  22,  5, 'pieza'),
    ('CON-001', 'Bulto cemento Portland 50kg',  5, 95.00, 160.00,  30,  5, 'bulto'),
    ('CON-002', 'Varilla corrugada 3/8" x 6m',  5, 45.00,  80.00,  40,  8, 'pieza'),
    ('FIJ-001', 'Clavo 2" c/cabeza (kg)',        6,  9.00,  18.00,  50, 10, 'kg'),
    ('FIJ-002', 'Tornillo 3/8" x 2" (100pz)',   6, 12.00,  25.00,  35, 10, 'bolsa');

-- ──────────────────────────────────────────────
--  5. VISTA ÚTIL: productos con stock bajo
-- ──────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_stock_bajo AS
    SELECT 
        p.id,
        p.codigo,
        p.nombre,
        c.nombre  AS categoria,
        p.cantidad,
        p.stock_minimo,
        p.unidad,
        (p.stock_minimo - p.cantidad) AS unidades_faltantes
    FROM  productos p
    JOIN  categorias c ON p.categoria_id = c.id
    WHERE p.cantidad <= p.stock_minimo
      AND p.activo = TRUE
    ORDER BY (p.cantidad - p.stock_minimo) ASC;

-- ──────────────────────────────────────────────
--  NOTAS DE CONEXIÓN
--  MySQL:      mysql -u root -p ferreteria < database.sql
--  PostgreSQL: psql -U postgres -d ferreteria -f database.sql
--  Para PostgreSQL reemplaza:
--    INT AUTO_INCREMENT → SERIAL
--    ENUM(...)          → VARCHAR(10) CHECK (tipo IN (...))
--    ON UPDATE CURRENT_TIMESTAMP → se maneja con un trigger
-- ──────────────────────────────────────────────
