// const API_URL = 'http://localhost:8000/backend_ordenes.php';
const API_URL = '../../backend_ordenes.php';
let pedidos = [];
let pedidosFiltrados = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarPedidos();
    
    document.getElementById('filterEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('orderBy').addEventListener('change', aplicarFiltros);
});

function cargarPedidos() {
    // Cargar desde localStorage (datos locales)
    pedidos = JSON.parse(localStorage.getItem('historial') || '[]');
    pedidosFiltrados = [...pedidos];
    aplicarFiltros();
}

async function sincronizarConBackend() {
    document.getElementById('loading').style.display = 'block';

    try {
        const response = await fetch(API_URL);
        const pedidosBackend = await response.json();

        // Combinar pedidos del backend con los locales
        const pedidosLocales = JSON.parse(localStorage.getItem('historial') || '[]');
        
        // Agregar datos del backend que no estén en local
        pedidosBackend.forEach(pedidoBack => {
            const existe = pedidosLocales.find(p => p.id === pedidoBack.id);
            if (!existe) {
                pedidosLocales.push({
                    id: pedidoBack.id,
                    fecha: pedidoBack.fecha,
                    total: parseFloat(pedidoBack.total),
                    estado: pedidoBack.estado,
                    items: []
                });
            }
        });

        localStorage.setItem('historial', JSON.stringify(pedidosLocales));
        pedidos = pedidosLocales;
        pedidosFiltrados = [...pedidos];
        
        alert('Sincronización completada');
        aplicarFiltros();
    } catch (error) {
        console.error('Error al sincronizar:', error);
        alert('Error al sincronizar con el servidor');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function aplicarFiltros() {
    const estado = document.getElementById('filterEstado').value;
    const orden = document.getElementById('orderBy').value;

    // Filtrar por estado
    pedidosFiltrados = estado 
        ? pedidos.filter(p => p.estado === estado)
        : [...pedidos];

    // Ordenar
    switch(orden) {
        case 'reciente':
            pedidosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            break;
        case 'antiguo':
            pedidosFiltrados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            break;
        case 'mayor':
            pedidosFiltrados.sort((a, b) => b.total - a.total);
            break;
        case 'menor':
            pedidosFiltrados.sort((a, b) => a.total - b.total);
            break;
    }

    mostrarPedidos();
}

function mostrarPedidos() {
    const container = document.getElementById('ordersContainer');

    if (pedidosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No hay pedidos</h3>
                <p class="text-muted">Aún no has realizado ningún pedido</p>
                <a href="catalogo.html" class="btn btn-primary mt-3">Explorar Productos</a>
            </div>
        `;
        return;
    }

    container.innerHTML = pedidosFiltrados.map(pedido => {
        const fecha = new Date(pedido.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const totalItems = pedido.items ? pedido.items.reduce((sum, item) => sum + item.cantidad, 0) : 0;

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Orden #${pedido.id}</span>
                        <div class="text-muted small mt-1">📅 ${fechaFormateada}</div>
                    </div>
                    <span class="badge-${pedido.estado}">
                        ${pedido.estado === 'pendiente' ? '⏳ Pendiente' : '✅ Completado'}
                    </span>
                </div>

                <div class="row align-items-center">
                    <div class="col-md-3">
                        <div class="text-muted small">TOTAL</div>
                        <div class="order-total">$${parseFloat(pedido.total).toFixed(2)}</div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-muted small">ITEMS</div>
                        <div class="fw-bold">${totalItems} productos/servicios</div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-muted small">ESTADO</div>
                        <div class="fw-bold text-capitalize">${pedido.estado}</div>
                    </div>
                    <div class="col-md-3 text-end">
                        <button class="btn btn-primary btn-sm" onclick="verDetallePedido(${pedido.id})">
                            Ver Detalle
                        </button>
                    </div>
                </div>

                ${pedido.items && pedido.items.length > 0 ? `
                    <div class="mt-3">
                        <div class="text-muted small mb-2">RESUMEN DE ITEMS:</div>
                        ${pedido.items.slice(0, 3).map(item => `
                            <div class="item-row d-flex justify-content-between">
                                <span>
                                    ${item.tipo === 'producto' ? '📦' : '🔧'} ${item.nombre}
                                </span>
                                <span class="text-muted">x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        ${pedido.items.length > 3 ? `
                            <div class="text-muted small text-center mt-2">
                                y ${pedido.items.length - 3} items más...
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function verDetallePedido(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    
    if (!pedido) return;

    const fecha = new Date(pedido.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('detallePedidoTitulo').textContent = `Pedido #${pedido.id}`;

    const detalleHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <p class="text-muted small mb-1">FECHA DEL PEDIDO</p>
                <p class="fw-bold">${fechaFormateada}</p>
            </div>
            <div class="col-md-6">
                <p class="text-muted small mb-1">ESTADO</p>
                <span class="badge-${pedido.estado}">
                    ${pedido.estado === 'pendiente' ? '⏳ Pendiente' : '✅ Completado'}
                </span>
            </div>
        </div>

        <h5 class="mb-3">Items del Pedido</h5>
        ${pedido.items && pedido.items.length > 0 ? pedido.items.map(item => `
            <div class="item-row mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">
                            ${item.tipo === 'producto' ? '📦' : '🔧'} ${item.nombre}
                        </div>
                        <small class="text-muted">
                            ${item.tipo === 'producto' ? `Cantidad: ${item.cantidad}` : 'Servicio'}
                            ${item.horario ? ` | 🕒 ${item.horario}` : ''}
                        </small>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold text-primary">$${(item.precio * item.cantidad).toFixed(2)}</div>
                        <small class="text-muted">$${item.precio.toFixed(2)} c/u</small>
                    </div>
                </div>
            </div>
        `).join('') : '<p class="text-muted">No hay detalles de items disponibles</p>'}

        <hr class="my-4">

        <div class="row">
            <div class="col-6">
                <h5>Total del Pedido</h5>
            </div>
            <div class="col-6 text-end">
                <h3 class="text-primary">$${parseFloat(pedido.total).toFixed(2)}</h3>
            </div>
        </div>

        <div class="alert alert-info mt-3">
            <strong>ℹ️ Nota:</strong> Para más información sobre tu pedido, 
            contacta al vendedor/técnico directamente.
        </div>
    `;

    document.getElementById('detallePedidoBody').innerHTML = detalleHTML;

    const modal = new bootstrap.Modal(document.getElementById('modalDetallePedido'));
    modal.show();
}