document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    // Registrar Producto
    document.getElementById('form-producto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const producto = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('desc').value,
            precio: parseFloat(document.getElementById('precio').value),
            stock: parseInt(document.getElementById('stock').value),
            categoria: document.getElementById('cat').value
        };

        const res = await fetch('../../backend_productos.php', {
            method: 'POST',
            body: JSON.stringify(producto),
            headers: {'Content-Type': 'application/json'}
        });
        
        if(res.ok) {
            alert('Producto registrado');
            cargarProductos(); // Recargar lista
        }
    });

    // Filtro Categoría (Frontend simple)
    document.getElementById('filtro-categoria').addEventListener('change', (e) => {
        cargarProductos(e.target.value);
    });
});

async function cargarProductos(filtroCat = '') {
    const res = await fetch('../../backend_productos.php');
    const productos = await res.json();
    const contenedor = document.getElementById('lista-productos');
    contenedor.innerHTML = '';

    const filtrados = filtroCat ? productos.filter(p => p.categoria === filtroCat) : productos;

    filtrados.forEach(p => {
        contenedor.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${p.nombre}</h5>
                        <p class="card-text">${p.descripcion}</p>
                        <p class="text-primary fw-bold">$${p.precio}</p>
                        <button class="btn btn-primary btn-sm" onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${p.precio})">
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Función auxiliar para conectar con el módulo de Anthony
function agregarAlCarrito(id, nombre, precio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push({ id, nombre, precio, tipo: 'producto' });
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert('Producto agregado al carrito');
}