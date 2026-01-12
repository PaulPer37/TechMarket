document.addEventListener('DOMContentLoaded', cargarServicios);

document.getElementById('form-servicio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const servicio = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('desc').value,
        costo_base: document.getElementById('costo').value,
        horario_atencion: document.getElementById('horario').value
    };

    await fetch('../../backend_servicios.php', {
        method: 'POST',
        body: JSON.stringify(servicio)
    });
    alert('Servicio Publicado');
    cargarServicios();
});

async function cargarServicios() {
    const res = await fetch('../../backend_servicios.php');
    const servicios = await res.json();
    const div = document.getElementById('lista-servicios');
    div.innerHTML = '';

    servicios.forEach(s => {
        div.innerHTML += `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${s.titulo} <span class="badge bg-secondary">$${s.costo_base}</span></h5>
                        <p>${s.descripcion}</p>
                        <small class="text-muted">Horario: ${s.horario_atencion}</small>
                        <br>
                        <button class="btn btn-outline-info btn-sm mt-2">Contactar Técnico</button>
                    </div>
                </div>
            </div>
        `;
    });
}