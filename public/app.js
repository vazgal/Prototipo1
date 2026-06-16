/* ============================================================
   INVENTARIOFERR · app.js
   Lógica del sistema de gestión de inventario para ferretería.
   Modo DEMO: datos en memoria (localStorage).
   Modo PRODUCCIÓN: reemplaza las funciones marcadas con 🔌
   para conectar a tu API REST en Node.js/Python.
   ============================================================ */

'use strict';

// ══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN
// ══════════════════════════════════════════════════════════════
const CONFIG = {
  STOCK_MINIMO_DEFAULT: 5,
  // 🔌 Cambia esto a la URL de tu backend en producción:
  API_BASE_URL: '/api',
  // true  = usa localStorage (modo demo sin servidor)
  // false = usa API REST real
  MODO_DEMO: true,
};


// ══════════════════════════════════════════════════════════════
//  ESTADO GLOBAL DE LA APLICACIÓN
// ══════════════════════════════════════════════════════════════
const Estado = {
  productos:        [],   // Todos los productos cargados
  movimientos:      [],   // Historial de movimientos
  categorias:       [],   // Lista de categorías
  productoEditando: null, // ID del producto en edición (null = nuevo)
  productoAjuste:   null, // ID del producto siendo ajustado
  productoEliminar: null, // ID del producto a eliminar
  tipoAjuste:       'entrada', // 'entrada' | 'salida'
  terminoBusqueda:  '',
  filtroCategoria:  '',
  columnaOrden:     'nombre',
  ordenAscendente:  true,
};


// ══════════════════════════════════════════════════════════════
//  DATOS DEMO (se almacenan en localStorage)
// ══════════════════════════════════════════════════════════════
const CATEGORIAS_DEMO = [
  { id: 1, nombre: 'Plomería' },
  { id: 2, nombre: 'Electricidad' },
  { id: 3, nombre: 'Herramientas' },
  { id: 4, nombre: 'Pintura' },
  { id: 5, nombre: 'Construcción' },
  { id: 6, nombre: 'Fijaciones' },
  { id: 7, nombre: 'Jardinería' },
  { id: 8, nombre: 'General' },
];

const PRODUCTOS_DEMO = [
  { id: 1,  codigo: 'PLO-001', nombre: 'Codo de cobre 1/2"',        categoria_id: 1, precio_compra: 8.50,  precio_venta: 15.00, cantidad: 45,  stock_minimo: 5,  unidad: 'pieza',   descripcion: '' },
  { id: 2,  codigo: 'PLO-002', nombre: 'Tubo galvanizado 1" x 6m',  categoria_id: 1, precio_compra: 85.00, precio_venta: 150.00,cantidad: 12,  stock_minimo: 3,  unidad: 'pieza',   descripcion: '' },
  { id: 3,  codigo: 'PLO-003', nombre: 'Llave de paso 3/4"',         categoria_id: 1, precio_compra: 45.00, precio_venta: 80.00, cantidad: 8,   stock_minimo: 5,  unidad: 'pieza',   descripcion: '' },
  { id: 4,  codigo: 'PLO-004', nombre: 'Cinta teflón 3/4"',          categoria_id: 1, precio_compra: 3.50,  precio_venta: 8.00,  cantidad: 120, stock_minimo: 10, unidad: 'rollo',   descripcion: '' },
  { id: 5,  codigo: 'PLO-005', nombre: 'Tee de cobre 1/2"',          categoria_id: 1, precio_compra: 9.00,  precio_venta: 16.00, cantidad: 3,   stock_minimo: 5,  unidad: 'pieza',   descripcion: '' },
  { id: 6,  codigo: 'ELE-001', nombre: 'Cable THW calibre 12 (100m)',categoria_id: 2, precio_compra: 180.00,precio_venta: 320.00,cantidad: 6,   stock_minimo: 2,  unidad: 'rollo',   descripcion: '' },
  { id: 7,  codigo: 'ELE-002', nombre: 'Contacto doble polarizado',  categoria_id: 2, precio_compra: 18.00, precio_venta: 35.00, cantidad: 50,  stock_minimo: 8,  unidad: 'pieza',   descripcion: '' },
  { id: 8,  codigo: 'ELE-003', nombre: 'Interruptor sencillo',        categoria_id: 2, precio_compra: 12.00, precio_venta: 25.00, cantidad: 40,  stock_minimo: 10, unidad: 'pieza',   descripcion: '' },
  { id: 9,  codigo: 'ELE-004', nombre: 'Foco LED 9W E27',            categoria_id: 2, precio_compra: 22.00, precio_venta: 42.00, cantidad: 4,   stock_minimo: 8,  unidad: 'pieza',   descripcion: '' },
  { id: 10, codigo: 'ELE-005', nombre: 'Clavija 2P+T 15A',           categoria_id: 2, precio_compra: 8.00,  precio_venta: 18.00, cantidad: 4,   stock_minimo: 5,  unidad: 'pieza',   descripcion: '' },
  { id: 11, codigo: 'HER-001', nombre: 'Desarmador plano 6"',         categoria_id: 3, precio_compra: 15.00, precio_venta: 30.00, cantidad: 25,  stock_minimo: 5,  unidad: 'pieza',   descripcion: '' },
  { id: 12, codigo: 'HER-002', nombre: 'Pinza de presión 10"',        categoria_id: 3, precio_compra: 45.00, precio_venta: 90.00, cantidad: 15,  stock_minimo: 3,  unidad: 'pieza',   descripcion: '' },
  { id: 13, codigo: 'HER-003', nombre: 'Martillo uña 16 oz',          categoria_id: 3, precio_compra: 55.00, precio_venta: 110.00,cantidad: 10,  stock_minimo: 3,  unidad: 'pieza',   descripcion: '' },
  { id: 14, codigo: 'HER-004', nombre: 'Cinta métrica 5m',            categoria_id: 3, precio_compra: 28.00, precio_venta: 55.00, cantidad: 20,  stock_minimo: 5,  unidad: 'pieza',   descripcion: '' },
  { id: 15, codigo: 'PIN-001', nombre: 'Pintura vinílica blanca 4L',  categoria_id: 4, precio_compra: 85.00, precio_venta: 155.00,cantidad: 18,  stock_minimo: 4,  unidad: 'cubeta',  descripcion: '' },
  { id: 16, codigo: 'PIN-002', nombre: 'Rodillo de 9" para pintura',  categoria_id: 4, precio_compra: 18.00, precio_venta: 38.00, cantidad: 22,  stock_minimo: 5,  unidad: 'pieza',   descripcion: '' },
  { id: 17, codigo: 'CON-001', nombre: 'Bulto cemento Portland 50kg', categoria_id: 5, precio_compra: 95.00, precio_venta: 160.00,cantidad: 30,  stock_minimo: 5,  unidad: 'bulto',   descripcion: '' },
  { id: 18, codigo: 'CON-002', nombre: 'Varilla corrugada 3/8" x 6m', categoria_id: 5, precio_compra: 45.00, precio_venta: 80.00, cantidad: 40,  stock_minimo: 8,  unidad: 'pieza',   descripcion: '' },
  { id: 19, codigo: 'FIJ-001', nombre: 'Clavo 2" c/cabeza (kg)',       categoria_id: 6, precio_compra: 9.00,  precio_venta: 18.00, cantidad: 50,  stock_minimo: 10, unidad: 'kg',      descripcion: '' },
  { id: 20, codigo: 'FIJ-002', nombre: 'Tornillo 3/8" x 2" (100pz)',  categoria_id: 6, precio_compra: 12.00, precio_venta: 25.00, cantidad: 35,  stock_minimo: 10, unidad: 'bolsa',   descripcion: '' },
];


// ══════════════════════════════════════════════════════════════
//  CAPA DE DATOS — reemplaza estas funciones con fetch() reales
// ══════════════════════════════════════════════════════════════

/**
 * Carga todos los productos desde localStorage (modo demo)
 * 🔌 PRODUCCIÓN: GET /api/productos
 */
async function cargarProductos() {
  if (CONFIG.MODO_DEMO) {
    const guardados = localStorage.getItem('ferr_productos');
    Estado.productos = guardados ? JSON.parse(guardados) : [...PRODUCTOS_DEMO];
    persistirProductos();
    return Estado.productos;
  }
  const res = await fetch(`${CONFIG.API_BASE_URL}/productos`);
  Estado.productos = await res.json();
  return Estado.productos;
}

/**
 * Guarda/actualiza un producto
 * 🔌 PRODUCCIÓN: POST /api/productos  o  PUT /api/productos/:id
 */
async function guardarProductoAPI(productoData) {
  if (CONFIG.MODO_DEMO) {
    if (productoData.id) {
      const idx = Estado.productos.findIndex(p => p.id === productoData.id);
      if (idx !== -1) Estado.productos[idx] = { ...Estado.productos[idx], ...productoData };
    } else {
      const nuevoId = Math.max(0, ...Estado.productos.map(p => p.id)) + 1;
      Estado.productos.push({ ...productoData, id: nuevoId });
    }
    persistirProductos();
    return true;
  }
  const metodo = productoData.id ? 'PUT' : 'POST';
  const url    = productoData.id
    ? `${CONFIG.API_BASE_URL}/productos/${productoData.id}`
    : `${CONFIG.API_BASE_URL}/productos`;
  const res = await fetch(url, {
    method:  metodo,
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(productoData),
  });
  return res.ok;
}

/**
 * Elimina un producto por ID
 * 🔌 PRODUCCIÓN: DELETE /api/productos/:id
 */
async function eliminarProductoAPI(productoId) {
  if (CONFIG.MODO_DEMO) {
    Estado.productos = Estado.productos.filter(p => p.id !== productoId);
    persistirProductos();
    return true;
  }
  const res = await fetch(`${CONFIG.API_BASE_URL}/productos/${productoId}`, { method: 'DELETE' });
  return res.ok;
}

/**
 * Registra un movimiento de stock
 * 🔌 PRODUCCIÓN: POST /api/movimientos
 */
async function registrarMovimientoAPI(movimiento) {
  if (CONFIG.MODO_DEMO) {
    const id = Estado.movimientos.length + 1;
    Estado.movimientos.unshift({ id, ...movimiento, creado_en: new Date().toISOString() });
    persistirMovimientos();
    return true;
  }
  const res = await fetch(`${CONFIG.API_BASE_URL}/movimientos`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(movimiento),
  });
  return res.ok;
}

/**
 * Carga historial de movimientos
 * 🔌 PRODUCCIÓN: GET /api/movimientos
 */
async function cargarMovimientos() {
  if (CONFIG.MODO_DEMO) {
    const guardados = localStorage.getItem('ferr_movimientos');
    Estado.movimientos = guardados ? JSON.parse(guardados) : [];
    return Estado.movimientos;
  }
  const res = await fetch(`${CONFIG.API_BASE_URL}/movimientos`);
  Estado.movimientos = await res.json();
  return Estado.movimientos;
}

function persistirProductos()   { localStorage.setItem('ferr_productos',    JSON.stringify(Estado.productos)); }
function persistirMovimientos() { localStorage.setItem('ferr_movimientos',  JSON.stringify(Estado.movimientos)); }


// ══════════════════════════════════════════════════════════════
//  INICIALIZACIÓN
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar datos
  Estado.categorias = [...CATEGORIAS_DEMO];
  await cargarProductos();
  await cargarMovimientos();

  // Poblar selects de categoría
  poblarSelectCategorias();

  // Renderizar todo
  actualizarDashboard();
  renderizarTablaProductos();
  renderizarStockBajo();
  renderizarMovimientos();

  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      limpiarBusqueda();
      cerrarModalProducto();
      cerrarModalAjuste();
      cerrarModalEliminar();
    }
    // Ctrl+B = enfocar buscador
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      document.getElementById('buscador-global').focus();
    }
  });

  // Calcular margen en tiempo real en el formulario
  ['campo-precio-compra', 'campo-precio-venta'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcularMargen);
  });

  // Actualizar preview en modal de ajuste cuando cambia la cantidad
  document.getElementById('campo-ajuste-cantidad')?.addEventListener('input', actualizarPreviewAjuste);
});


// ══════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════
function actualizarDashboard() {
  const totalProductos = Estado.productos.length;
  const totalUnidades  = Estado.productos.reduce((acc, p) => acc + p.cantidad, 0);
  const valorTotal     = Estado.productos.reduce((acc, p) => acc + (p.precio_venta * p.cantidad), 0);
  const stockBajoList  = Estado.productos.filter(p => p.cantidad <= p.stock_minimo);

  // KPIs
  animarContador('kpi-total-productos', totalProductos);
  animarContador('kpi-total-unidades',  totalUnidades);
  document.getElementById('kpi-valor-inventario').textContent = formatearPeso(valorTotal);
  animarContador('kpi-stock-bajo', stockBajoList.length);

  // Badge sidebar
  const badge = document.getElementById('badge-stock-bajo');
  badge.textContent = stockBajoList.length;
  badge.setAttribute('data-count', stockBajoList.length);

  // Lista de alertas
  const listaAlertas = document.getElementById('lista-alertas');
  if (stockBajoList.length === 0) {
    listaAlertas.innerHTML = '<p class="alerta-vacia">✅ ¡Todos los productos tienen stock suficiente!</p>';
  } else {
    listaAlertas.innerHTML = stockBajoList
      .sort((a, b) => a.cantidad - b.cantidad)
      .map(p => `
        <div class="alerta-item">
          <span class="alerta-codigo">${p.codigo}</span>
          <span class="alerta-nombre">${p.nombre}</span>
          <span class="alerta-stock">⚠ ${p.cantidad} ${p.unidad}(s)</span>
          <button class="alerta-btn" onclick="abrirModalAjuste(${p.id})">Agregar stock</button>
        </div>
      `).join('');
  }

  // Resumen por categorías
  renderizarCategoriasGrid();
}

function renderizarCategoriasGrid() {
  const grid = document.getElementById('grid-categorias');
  const resumen = Estado.categorias.map(cat => {
    const productos = Estado.productos.filter(p => p.categoria_id === cat.id);
    return { ...cat, count: productos.length };
  }).filter(c => c.count > 0);

  grid.innerHTML = resumen.map(cat => `
    <div class="categoria-chip" onclick="filtrarPorCategoria(${cat.id})">
      <span class="categoria-chip-nombre">${cat.nombre}</span>
      <span class="categoria-chip-count">${cat.count}</span>
    </div>
  `).join('');
}

function filtrarPorCategoria(categoriaId) {
  Estado.filtroCategoria = String(categoriaId);
  const select = document.getElementById('filtro-categoria');
  if (select) select.value = String(categoriaId);
  cambiarVista('inventario', document.querySelector('[data-view="inventario"]'));
  renderizarTablaProductos();
}

function animarContador(elementoId, valorFinal) {
  const el       = document.getElementById(elementoId);
  const valorAnt = parseInt(el.textContent.replace(/\D/g, '')) || 0;
  const delta    = valorFinal - valorAnt;
  const pasos    = 20;
  let paso       = 0;

  const intervalo = setInterval(() => {
    paso++;
    el.textContent = Math.round(valorAnt + (delta * (paso / pasos)));
    if (paso >= pasos) { el.textContent = valorFinal; clearInterval(intervalo); }
  }, 20);
}


// ══════════════════════════════════════════════════════════════
//  TABLA DE PRODUCTOS
// ══════════════════════════════════════════════════════════════
function productosVisibles() {
  let lista = [...Estado.productos];

  // Filtro por búsqueda
  const termino = Estado.terminoBusqueda.toLowerCase().trim();
  if (termino) {
    lista = lista.filter(p =>
      p.codigo.toLowerCase().includes(termino) ||
      p.nombre.toLowerCase().includes(termino) ||
      (p.descripcion || '').toLowerCase().includes(termino)
    );
  }

  // Filtro por categoría
  if (Estado.filtroCategoria) {
    lista = lista.filter(p => p.categoria_id === parseInt(Estado.filtroCategoria));
  }

  // Ordenación
  const col = Estado.columnaOrden;
  lista.sort((a, b) => {
    let valA = a[col] ?? '';
    let valB = b[col] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return Estado.ordenAscendente ? -1 : 1;
    if (valA > valB) return Estado.ordenAscendente ?  1 : -1;
    return 0;
  });

  return lista;
}

function renderizarTablaProductos() {
  const lista   = productosVisibles();
  const cuerpo  = document.getElementById('cuerpo-tabla');
  const contador = document.getElementById('contador-resultados');

  if (lista.length === 0) {
    cuerpo.innerHTML = `
      <tr>
        <td colspan="6" class="tabla-vacia">
          ${Estado.terminoBusqueda
            ? `🔍 No se encontraron productos para "<strong>${Estado.terminoBusqueda}</strong>"`
            : '📦 No hay productos registrados. ¡Agrega el primero!'}
        </td>
      </tr>`;
    contador.textContent = '0 productos';
    return;
  }

  cuerpo.innerHTML = lista.map(p => {
    const cat        = Estado.categorias.find(c => c.id === p.categoria_id);
    const esBajo     = p.cantidad <= p.stock_minimo;
    const stockBadge = esBajo
      ? `<span class="stock-badge-bajo">⚠ ${p.cantidad} ${p.unidad}</span>`
      : `<span class="stock-ok">${p.cantidad} ${p.unidad}</span>`;

    return `
      <tr class="${esBajo ? 'fila-stock-bajo' : ''}">
        <td><span class="col-codigo">${p.codigo}</span></td>
        <td class="col-nombre">${p.nombre}</td>
        <td><span class="col-categoria">${cat ? cat.nombre : '—'}</span></td>
        <td class="col-precio">${formatearPeso(p.precio_venta)}</td>
        <td>${stockBadge}</td>
        <td>
          <div class="acciones-celda">
            <button class="btn-accion btn-editar" onclick="abrirModalProducto(${p.id})" title="Editar producto">✏ Editar</button>
            <button class="btn-accion btn-stock"  onclick="abrirModalAjuste(${p.id})"   title="Ajustar stock">📦 Stock</button>
            <button class="btn-accion btn-borrar" onclick="abrirModalEliminar(${p.id})" title="Eliminar">🗑</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  const totalStr = Estado.terminoBusqueda || Estado.filtroCategoria
    ? `${lista.length} de ${Estado.productos.length} productos`
    : `${lista.length} producto${lista.length !== 1 ? 's' : ''}`;
  contador.textContent = totalStr;
}

function renderizarStockBajo() {
  const lista   = Estado.productos.filter(p => p.cantidad <= p.stock_minimo);
  const cuerpo  = document.getElementById('cuerpo-stock-bajo');

  if (lista.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="7" class="tabla-vacia">✅ ¡No hay productos con stock bajo!</td></tr>';
    return;
  }

  cuerpo.innerHTML = lista
    .sort((a, b) => a.cantidad - b.cantidad)
    .map(p => {
      const cat      = Estado.categorias.find(c => c.id === p.categoria_id);
      const faltante = p.stock_minimo - p.cantidad;
      return `
        <tr class="fila-stock-bajo">
          <td><span class="col-codigo">${p.codigo}</span></td>
          <td class="col-nombre">${p.nombre}</td>
          <td><span class="col-categoria">${cat ? cat.nombre : '—'}</span></td>
          <td><span class="stock-badge-bajo">⚠ ${p.cantidad}</span></td>
          <td>${p.stock_minimo}</td>
          <td style="color: var(--rojo); font-weight: 700">${faltante > 0 ? `−${faltante}` : '0'}</td>
          <td>
            <button class="btn-accion btn-stock" onclick="abrirModalAjuste(${p.id})">📦 Agregar</button>
          </td>
        </tr>`;
    }).join('');
}

function renderizarMovimientos() {
  const cuerpo   = document.getElementById('cuerpo-movimientos');
  const contador = document.getElementById('contador-movimientos');

  if (Estado.movimientos.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="7" class="tabla-vacia">🔄 No hay movimientos registrados.</td></tr>';
    contador.textContent = '0 movimientos';
    return;
  }

  cuerpo.innerHTML = Estado.movimientos.slice(0, 100).map(m => {
    const producto = Estado.productos.find(p => p.id === m.producto_id);
    const nombre   = producto ? producto.nombre : `Producto #${m.producto_id}`;
    const fechaStr = new Date(m.creado_en).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
    const badge    = `<span class="badge-${m.tipo}">${m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}</span>`;

    return `
      <tr>
        <td style="font-size:12px; color: var(--gris-texto)">${fechaStr}</td>
        <td class="col-nombre">${nombre}</td>
        <td>${badge}</td>
        <td style="font-weight: 700">${m.tipo === 'salida' ? `−${m.cantidad}` : `+${m.cantidad}`}</td>
        <td style="color: var(--gris-texto)">${m.cantidad_antes}</td>
        <td style="font-weight: 600">${m.cantidad_despues}</td>
        <td style="font-size: 12px; color: var(--gris-texto)">${m.motivo || '—'}</td>
      </tr>`;
  }).join('');

  contador.textContent = `${Estado.movimientos.length} movimiento${Estado.movimientos.length !== 1 ? 's' : ''}`;
}


// ══════════════════════════════════════════════════════════════
//  BÚSQUEDA EN TIEMPO REAL
// ══════════════════════════════════════════════════════════════
function buscarProductos(termino) {
  Estado.terminoBusqueda = termino;
  renderizarTablaProductos();

  // Si hay búsqueda activa, ir a la vista de inventario
  if (termino && document.getElementById('view-dashboard').classList.contains('active')) {
    cambiarVista('inventario', document.querySelector('[data-view="inventario"]'));
  }
}

function limpiarBusqueda() {
  const buscador = document.getElementById('buscador-global');
  buscador.value = '';
  Estado.terminoBusqueda = '';
  renderizarTablaProductos();
}


// ══════════════════════════════════════════════════════════════
//  ORDENACIÓN DE TABLA
// ══════════════════════════════════════════════════════════════
function ordenarPor(columna) {
  if (Estado.columnaOrden === columna) {
    Estado.ordenAscendente = !Estado.ordenAscendente;
  } else {
    Estado.columnaOrden    = columna;
    Estado.ordenAscendente = true;
  }
  renderizarTablaProductos();
}


// ══════════════════════════════════════════════════════════════
//  FILTRO POR CATEGORÍA (select del inventario)
// ══════════════════════════════════════════════════════════════
function aplicarFiltros() {
  Estado.filtroCategoria = document.getElementById('filtro-categoria').value;
  renderizarTablaProductos();
}

function poblarSelectCategorias() {
  const selects = ['filtro-categoria', 'campo-categoria'];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const primerOpcion = el.options[0];
    el.innerHTML = '';
    el.appendChild(primerOpcion);
    Estado.categorias.forEach(cat => {
      const opt    = document.createElement('option');
      opt.value    = cat.id;
      opt.textContent = cat.nombre;
      el.appendChild(opt);
    });
  });
}


// ══════════════════════════════════════════════════════════════
//  MODAL CREAR / EDITAR PRODUCTO
// ══════════════════════════════════════════════════════════════
function abrirModalProducto(productoId = null) {
  Estado.productoEditando = productoId;
  const modal = document.getElementById('modal-producto');
  const titulo = document.getElementById('modal-titulo');
  const btnTexto = document.getElementById('btn-guardar-texto');

  limpiarFormularioProducto();

  if (productoId) {
    const producto = Estado.productos.find(p => p.id === productoId);
    if (!producto) return;

    titulo.textContent   = 'Editar Producto';
    btnTexto.textContent = 'Guardar Cambios';

    document.getElementById('campo-id').value             = producto.id;
    document.getElementById('campo-codigo').value         = producto.codigo;
    document.getElementById('campo-nombre').value         = producto.nombre;
    document.getElementById('campo-categoria').value      = producto.categoria_id;
    document.getElementById('campo-unidad').value         = producto.unidad || 'pieza';
    document.getElementById('campo-precio-compra').value  = producto.precio_compra;
    document.getElementById('campo-precio-venta').value   = producto.precio_venta;
    document.getElementById('campo-cantidad').value       = producto.cantidad;
    document.getElementById('campo-stock-minimo').value   = producto.stock_minimo;
    document.getElementById('campo-descripcion').value    = producto.descripcion || '';
  } else {
    titulo.textContent   = 'Nuevo Producto';
    btnTexto.textContent = 'Guardar Producto';
  }

  calcularMargen();
  modal.classList.add('abierto');
}

function cerrarModalProducto() {
  document.getElementById('modal-producto').classList.remove('abierto');
  Estado.productoEditando = null;
}

function limpiarFormularioProducto() {
  ['campo-id', 'campo-codigo', 'campo-nombre', 'campo-descripcion']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('campo-categoria').value    = '';
  document.getElementById('campo-unidad').value       = 'pieza';
  document.getElementById('campo-precio-compra').value = '';
  document.getElementById('campo-precio-venta').value  = '';
  document.getElementById('campo-cantidad').value      = '';
  document.getElementById('campo-stock-minimo').value  = CONFIG.STOCK_MINIMO_DEFAULT;

  // Remover errores previos
  document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
}

function calcularMargen() {
  const compra  = parseFloat(document.getElementById('campo-precio-compra').value) || 0;
  const venta   = parseFloat(document.getElementById('campo-precio-venta').value)  || 0;
  const el      = document.getElementById('margen-valor');

  if (compra > 0 && venta > 0) {
    const ganancia = venta - compra;
    const pct      = ((ganancia / compra) * 100).toFixed(1);
    el.textContent = `${formatearPeso(ganancia)} (${pct}%)`;
    el.style.color = ganancia >= 0 ? 'var(--verde)' : 'var(--rojo)';
  } else {
    el.textContent = '—';
  }
}

async function guardarProducto() {
  const codigo        = document.getElementById('campo-codigo').value.trim();
  const nombre        = document.getElementById('campo-nombre').value.trim();
  const categoriaId   = parseInt(document.getElementById('campo-categoria').value);
  const unidad        = document.getElementById('campo-unidad').value;
  const precioCompra  = parseFloat(document.getElementById('campo-precio-compra').value);
  const precioVenta   = parseFloat(document.getElementById('campo-precio-venta').value);
  const cantidad      = parseInt(document.getElementById('campo-cantidad').value);
  const stockMinimo   = parseInt(document.getElementById('campo-stock-minimo').value) || CONFIG.STOCK_MINIMO_DEFAULT;
  const descripcion   = document.getElementById('campo-descripcion').value.trim();
  const productoId    = document.getElementById('campo-id').value
    ? parseInt(document.getElementById('campo-id').value)
    : null;

  // Validación
  let errores = false;
  const marcarError = (id, cond) => {
    const el = document.getElementById(id);
    el.classList.toggle('error', cond);
    if (cond) errores = true;
  };

  marcarError('campo-codigo',        !codigo);
  marcarError('campo-nombre',        !nombre);
  marcarError('campo-categoria',     !categoriaId);
  marcarError('campo-precio-compra', isNaN(precioCompra) || precioCompra < 0);
  marcarError('campo-precio-venta',  isNaN(precioVenta)  || precioVenta  < 0);
  marcarError('campo-cantidad',      isNaN(cantidad)     || cantidad      < 0);

  if (errores) {
    mostrarToast('Por favor completa todos los campos requeridos.', 'error');
    return;
  }

  // Verificar código único
  const codigoDuplicado = Estado.productos.find(p =>
    p.codigo.toLowerCase() === codigo.toLowerCase() && p.id !== productoId
  );
  if (codigoDuplicado) {
    document.getElementById('campo-codigo').classList.add('error');
    mostrarToast(`El código "${codigo}" ya está en uso.`, 'error');
    return;
  }

  const datosProducto = {
    id: productoId,
    codigo, nombre, categoria_id: categoriaId, unidad,
    precio_compra: precioCompra, precio_venta: precioVenta,
    cantidad, stock_minimo: stockMinimo, descripcion,
  };

  const exito = await guardarProductoAPI(datosProducto);
  if (exito) {
    cerrarModalProducto();
    actualizarTodo();
    mostrarToast(productoId ? 'Producto actualizado correctamente.' : 'Producto agregado al inventario.', 'success');
  } else {
    mostrarToast('Error al guardar el producto.', 'error');
  }
}


// ══════════════════════════════════════════════════════════════
//  MODAL AJUSTE DE STOCK
// ══════════════════════════════════════════════════════════════
function abrirModalAjuste(productoId) {
  const producto = Estado.productos.find(p => p.id === productoId);
  if (!producto) return;

  Estado.productoAjuste = productoId;
  Estado.tipoAjuste     = 'entrada';

  document.getElementById('ajuste-nombre-producto').textContent = producto.nombre;
  document.getElementById('ajuste-stock-actual').textContent    = producto.cantidad;
  document.getElementById('ajuste-unidad-label').textContent    = `${producto.unidad}(s)`;
  document.getElementById('campo-ajuste-cantidad').value        = 1;
  document.getElementById('campo-ajuste-motivo').value          = '';

  seleccionarTipoAjuste('entrada');
  actualizarPreviewAjuste();

  document.getElementById('modal-ajuste').classList.add('abierto');
}

function cerrarModalAjuste() {
  document.getElementById('modal-ajuste').classList.remove('abierto');
  Estado.productoAjuste = null;
}

function cambiarCantidadAjuste(delta) {
  const input = document.getElementById('campo-ajuste-cantidad');
  const nuevo = Math.max(1, parseInt(input.value || 1) + delta);
  input.value = nuevo;
  actualizarPreviewAjuste();
}

function seleccionarTipoAjuste(tipo) {
  Estado.tipoAjuste = tipo;
  document.getElementById('btn-entrada').classList.toggle('active', tipo === 'entrada');
  document.getElementById('btn-salida').classList.toggle('active', tipo === 'salida');
  actualizarPreviewAjuste();
}

function actualizarPreviewAjuste() {
  const producto  = Estado.productos.find(p => p.id === Estado.productoAjuste);
  if (!producto) return;

  const cantidad  = parseInt(document.getElementById('campo-ajuste-cantidad').value) || 0;
  const resultado = Estado.tipoAjuste === 'entrada'
    ? producto.cantidad + cantidad
    : Math.max(0, producto.cantidad - cantidad);

  document.getElementById('ajuste-resultado').textContent = resultado;
}

async function confirmarAjuste() {
  const producto = Estado.productos.find(p => p.id === Estado.productoAjuste);
  if (!producto) return;

  const cantidadMovimiento = parseInt(document.getElementById('campo-ajuste-cantidad').value) || 0;
  const motivo             = document.getElementById('campo-ajuste-motivo').value.trim();

  if (cantidadMovimiento <= 0) {
    mostrarToast('La cantidad debe ser mayor a 0.', 'warn');
    return;
  }

  const cantidadAntes = producto.cantidad;
  let cantidadDespues;

  if (Estado.tipoAjuste === 'entrada') {
    cantidadDespues = cantidadAntes + cantidadMovimiento;
  } else {
    if (cantidadMovimiento > cantidadAntes) {
      mostrarToast(`No puedes restar más de ${cantidadAntes} ${producto.unidad}(s).`, 'error');
      return;
    }
    cantidadDespues = cantidadAntes - cantidadMovimiento;
  }

  // Actualizar cantidad del producto
  const datosActualizados = { ...producto, cantidad: cantidadDespues };
  await guardarProductoAPI(datosActualizados);

  // Registrar movimiento
  await registrarMovimientoAPI({
    producto_id:      producto.id,
    tipo:             Estado.tipoAjuste,
    cantidad:         cantidadMovimiento,
    cantidad_antes:   cantidadAntes,
    cantidad_despues: cantidadDespues,
    motivo:           motivo || `${Estado.tipoAjuste === 'entrada' ? 'Entrada' : 'Salida'} de mercancía`,
  });

  cerrarModalAjuste();
  actualizarTodo();
  mostrarToast(
    Estado.tipoAjuste === 'entrada'
      ? `✅ Entrada registrada. Stock: ${cantidadDespues} ${producto.unidad}(s).`
      : `📤 Salida registrada. Stock: ${cantidadDespues} ${producto.unidad}(s).`,
    'success'
  );
}


// ══════════════════════════════════════════════════════════════
//  MODAL ELIMINAR PRODUCTO
// ══════════════════════════════════════════════════════════════
function abrirModalEliminar(productoId) {
  const producto = Estado.productos.find(p => p.id === productoId);
  if (!producto) return;

  Estado.productoEliminar = productoId;
  document.getElementById('eliminar-nombre-producto').textContent = `"${producto.nombre}"`;
  document.getElementById('modal-eliminar').classList.add('abierto');
}

function cerrarModalEliminar() {
  document.getElementById('modal-eliminar').classList.remove('abierto');
  Estado.productoEliminar = null;
}

async function confirmarEliminacion() {
  if (!Estado.productoEliminar) return;
  const producto = Estado.productos.find(p => p.id === Estado.productoEliminar);
  const exito    = await eliminarProductoAPI(Estado.productoEliminar);

  if (exito) {
    cerrarModalEliminar();
    actualizarTodo();
    mostrarToast(`"${producto?.nombre || 'Producto'}" eliminado del inventario.`, 'info');
  } else {
    mostrarToast('Error al eliminar el producto.', 'error');
  }
}


// ══════════════════════════════════════════════════════════════
//  EXPORTACIÓN A CSV / EXCEL
// ══════════════════════════════════════════════════════════════
function exportarCSV() {
  const lista = productosVisibles();

  const encabezados = ['Código', 'Nombre', 'Categoría', 'Precio Compra', 'Precio Venta', 'Cantidad', 'Unidad', 'Stock Mínimo', 'Estado'];

  const filas = lista.map(p => {
    const cat   = Estado.categorias.find(c => c.id === p.categoria_id);
    const estado = p.cantidad <= p.stock_minimo ? 'STOCK BAJO' : 'OK';
    return [
      escaparCSV(p.codigo),
      escaparCSV(p.nombre),
      escaparCSV(cat ? cat.nombre : ''),
      p.precio_compra.toFixed(2),
      p.precio_venta.toFixed(2),
      p.cantidad,
      escaparCSV(p.unidad),
      p.stock_minimo,
      estado,
    ];
  });

  const csvContenido = [
    encabezados.join(','),
    ...filas.map(f => f.join(',')),
  ].join('\n');

  const bom       = '\uFEFF'; // BOM para que Excel abra con acentos correctamente
  const blob      = new Blob([bom + csvContenido], { type: 'text/csv;charset=utf-8;' });
  const url       = URL.createObjectURL(blob);
  const enlace    = document.createElement('a');
  const fechaHoy  = new Date().toISOString().slice(0, 10);

  enlace.href     = url;
  enlace.download = `inventario-ferreteria-${fechaHoy}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);

  mostrarToast(`✅ Exportados ${lista.length} productos al archivo CSV.`, 'success');
}

function escaparCSV(valor) {
  if (valor === null || valor === undefined) return '';
  const str = String(valor);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}


// ══════════════════════════════════════════════════════════════
//  NAVEGACIÓN ENTRE VISTAS
// ══════════════════════════════════════════════════════════════
function cambiarVista(nombreVista, enlaceActivo) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  // Desactivar todos los enlaces
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));

  // Mostrar la vista elegida
  const vista = document.getElementById(`view-${nombreVista}`);
  if (vista) vista.classList.add('active');

  // Activar el enlace
  if (enlaceActivo) enlaceActivo.classList.add('active');
  else {
    const link = document.querySelector(`[data-view="${nombreVista}"]`);
    if (link) link.classList.add('active');
  }

  // Cerrar sidebar en móvil
  if (window.innerWidth <= 768) toggleSidebar(false);

  // Renderizar la vista correcta
  if (nombreVista === 'dashboard')    actualizarDashboard();
  if (nombreVista === 'inventario')   renderizarTablaProductos();
  if (nombreVista === 'stock-bajo')   renderizarStockBajo();
  if (nombreVista === 'movimientos')  renderizarMovimientos();
}


// ══════════════════════════════════════════════════════════════
//  SIDEBAR MÓVIL
// ══════════════════════════════════════════════════════════════
function toggleSidebar(forzarEstado) {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const estaAbierto = sidebar.classList.contains('abierto');
  const abrir    = forzarEstado !== undefined ? forzarEstado : !estaAbierto;

  sidebar.classList.toggle('abierto',  abrir);
  overlay.classList.toggle('abierto',  abrir);
}


// ══════════════════════════════════════════════════════════════
//  HELPERS: CERRAR MODAL AL HACER CLIC EN OVERLAY
// ══════════════════════════════════════════════════════════════
function cerrarModalSiOverlay(event) {
  if (event.target === event.currentTarget) {
    const modalId = event.currentTarget.id;
    if (modalId === 'modal-producto') cerrarModalProducto();
    if (modalId === 'modal-ajuste')   cerrarModalAjuste();
    if (modalId === 'modal-eliminar') cerrarModalEliminar();
  }
}


// ══════════════════════════════════════════════════════════════
//  TOAST DE NOTIFICACIONES
// ══════════════════════════════════════════════════════════════
function mostrarToast(mensaje, tipo = 'info') {
  const contenedor = document.getElementById('toast-container');
  const toast      = document.createElement('div');
  toast.className  = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}


// ══════════════════════════════════════════════════════════════
//  ACTUALIZAR TODO (después de cambios en datos)
// ══════════════════════════════════════════════════════════════
function actualizarTodo() {
  actualizarDashboard();
  renderizarTablaProductos();
  renderizarStockBajo();
  renderizarMovimientos();
}


// ══════════════════════════════════════════════════════════════
//  FORMATEO
// ══════════════════════════════════════════════════════════════
function formatearPeso(numero) {
  return new Intl.NumberFormat('es-MX', {
    style:    'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(numero);
}
