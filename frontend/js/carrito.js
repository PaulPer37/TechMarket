const API_URL = '../../backend_ordenes.php';
let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
});

function cargarCarrito() {
    carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    mostrarCarrito();
    actualizarResumen();
}

function mostrarCarrito() {
    const container = document.getElementById('cartItems');

    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p class="text-muted">Agrega productos o servicios para comenzar</p>
                <a href="catalogo.html" class="btn btn-primary mt-3">Explorar Productos</a>
            </div>
        `;
        document.getElementById('btnProcesar').disabled = true;
        return;
    }

    document.getElementById('btnProcesar').disabled = false;

    container.innerHTML = carrito.map((item, index) => `
        <div class="cart-item">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="item-icon">
                        ${item.tipo === 'producto' ? '📦' : '🔧'}
                    </div>
                </div>
                
                <div class="col">
                    <h5 class="mb-1">${item.nombre}</h5>
                    <span class="badge bg-${item.tipo === 'producto' ? 'primary' : 'success'}">
                        ${item.tipo === 'producto' ? 'Producto' : 'Servicio'}
                    </span>
                    ${item.tipo === 'producto' ? `<small class="text-muted d-block mt-1">Stock disponible: ${item.stock}</small>` : ''}
                    ${item.horario ? `<small class="text-muted d-block mt-1">🕒 ${item.horario}</small>` : ''}
                </div>

                <div class="col-auto">
                    ${item.tipo === 'producto' ? `
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="cambiarCantidad(${index}, -1)">-</button>
                            <span class="fw-bold" style="min-width: 30px; text-align: center; display: inline-block;">
                                ${item.cantidad}
                            </span>
                            <button class="quantity-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
                        </div>
                    ` : `
                        <span class="badge bg-info">Cantidad: 1</span>
                    `}
                </div>

                <div class="col-auto text-end">
                    <div class="fw-bold text-primary" style="font-size: 1.2rem;">
                        $${(item.precio * item.cantidad).toFixed(2)}
                    </div>
                    <small class="text-muted">$${item.precio.toFixed(2)} c/u</small>
                </div>

                <div class="col-auto">
                    <button class="btn btn-danger btn-sm" onclick="eliminarItem(${index})">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function actualizarResumen() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('totalItems').textContent = totalItems;
}

function cambiarCantidad(index, cambio) {
    const item = carrito[index];
    
    if (item.tipo === 'producto') {
        const nuevaCantidad = item.cantidad + cambio;
        
        if (nuevaCantidad <= 0) {
            if (confirm('¿Deseas eliminar este producto del carrito?')) {
                eliminarItem(index);
            }
            return;
        }
        
        if (nuevaCantidad > item.stock) {
            alert(`Stock insuficiente. Máximo disponible: ${item.stock}`);
            return;
        }
        
        carrito[index].cantidad = nuevaCantidad;
        guardarCarrito();
    }
}

function eliminarItem(index) {
    if (confirm('¿Estás seguro de eliminar este item?')) {
        carrito.splice(index, 1);
        guardarCarrito();
    }
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        alert('El carrito ya está vacío');
        return;
    }
    
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
        carrito = [];
        guardarCarrito();
    }
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito();
}

async function procesarCompra() {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    const data = {
        total: total.toFixed(2),
        items: carrito
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.id) {
            // Guardar orden en historial
            let historial = JSON.parse(localStorage.getItem('historial') || '[]');
            historial.push({
                id: result.id,
                fecha: new Date().toISOString(),
                total: total,
                estado: 'pendiente',
                items: [...carrito]
            });
            localStorage.setItem('historial', JSON.stringify(historial));

            // Mostrar modal de éxito
            document.getElementById('ordenId').textContent = `#${result.id}`;
            const modal = new bootstrap.Modal(document.getElementById('modalConfirmarCompra'));
            modal.show();

            // Vaciar carrito
            carrito = [];
            localStorage.setItem('carrito', JSON.stringify(carrito));
            cargarCarrito();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la compra. Por favor intenta nuevamente.');
    }
}