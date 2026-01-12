document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    configurarFiltros();
});

let todosLosProductos = []; // Guardamos copia local para filtrar sin recargar la página

async function cargarProductos() {
    try {
        const res = await fetch('../../backend_productos.php');
        todosLosProductos = await res.json();
        renderizarProductos(todosLosProductos);
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

function renderizarProductos(lista) {
    const contenedor = document.getElementById('lista-productos');
    const mensaje = document.getElementById('mensaje-no-resultados');
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        mensaje.classList.remove('d-none');
        return;
    } else {
        mensaje.classList.add('d-none');
    }

    lista.forEach(p => {
        // IMAGEN: Como la base de datos no tiene campo de imagen, usamos una genérica
        // o una imagen aleatoria de tecnología basada en la categoría
        const imagenPlaceholder = `https://source.unsplash.com/300x200/?${p.categoria || 'technology'}`;
        
        contenedor.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${imagenPlaceholder}" class="card-img-top" alt="${p.nombre}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title text-truncate" title="${p.nombre}">${p.nombre}</h5>
                            <span class="badge bg-secondary">${p.categoria || 'General'}</span>
                        </div>
                        <p class="card-text text-muted small flex-grow-1">${p.descripcion}</p>
                        
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="fs-4 fw-bold text-primary">$${parseFloat(p.precio).toFixed(2)}</span>
                                <small class="text-muted">Stock: ${p.stock}</small>
                            </div>
                            <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${p.precio})">
                                <i class="bi bi-cart-plus"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function configurarFiltros() {
    const inputBusqueda = document.getElementById('busqueda');
    const selectCategoria = document.getElementById('filtro-categoria');
    const inputPrecio = document.getElementById('filtro-precio');
    const labelPrecio = document.getElementById('precio-valor');
    const btnLimpiar = document.getElementById('btn-limpiar');

    // Función que aplica todos los filtros a la vez
    const aplicarFiltros = () => {
        const texto = inputBusqueda.value.toLowerCase();
        const categoria = selectCategoria.value;
        const precioMax = parseFloat(inputPrecio.value);

        // Actualizar etiqueta del slider
        labelPrecio.innerText = precioMax;

        const filtrados = todosLosProductos.filter(p => {
            const cumpleTexto = p.nombre.toLowerCase().includes(texto) || 
                                (p.descripcion && p.descripcion.toLowerCase().includes(texto));
            const cumpleCategoria = categoria === "" || p.categoria === categoria;
            const cumplePrecio = parseFloat(p.precio) <= precioMax;

            return cumpleTexto && cumpleCategoria && cumplePrecio;
        });

        renderizarProductos(filtrados);
    };

    // Escuchar eventos
    inputBusqueda.addEventListener('input', aplicarFiltros);
    selectCategoria.addEventListener('change', aplicarFiltros);
    inputPrecio.addEventListener('input', aplicarFiltros);

    // Botón limpiar
    btnLimpiar.addEventListener('click', () => {
        inputBusqueda.value = '';
        selectCategoria.value = '';
        inputPrecio.value = 1000;
        aplicarFiltros();
    });
}

// Lógica del Formulario de Registro (POST)
document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('desc').value,
        precio: document.getElementById('precio').value,
        stock: document.getElementById('stock').value,
        categoria: document.getElementById('cat').value
    };

    const res = await fetch('../../backend_productos.php', {
        method: 'POST',
        body: JSON.stringify(nuevoProducto),
        headers: {'Content-Type': 'application/json'}
    });

    if(res.ok) {
        alert('Producto registrado exitosamente');
        // Cerrar modal manualmente
        const modalElement = document.getElementById('modalProducto');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        document.getElementById('form-producto').reset();
        cargarProductos(); // Recargar lista
    }
});

// Función auxiliar para el carrito (debe estar disponible globalmente)
function agregarAlCarrito(id, nombre, precio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push({ id, nombre, precio, tipo: 'producto' });
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert('Producto agregado al carrito');
}