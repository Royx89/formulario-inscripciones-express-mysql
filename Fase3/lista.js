const API = 'http://localhost:3000';

async function cargar() {
  const res = await fetch(`${API}/listar`);
  const data = await res.json();
  const tbody = document.querySelector('#tbl tbody');
  tbody.innerHTML = '';

  (data.data || []).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.nombre}</td>
      <td>${r.correo}</td>
      <td>${r.mensaje}</td>
      <td>${new Date(r.fecha).toLocaleString()}</td>
      <td>
        <button data-editar="${r.id}">Editar</button>
        <button data-borrar="${r.id}">Borrar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('click', async (e) => {
  // BORRAR
  if (e.target.matches('[data-borrar]')) {
    const id = e.target.getAttribute('data-borrar');
    if (!confirm(`¿Eliminar registro ${id}?`)) return;
    const res = await fetch(`${API}/inscripciones/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.mensaje || data.error);
    cargar();
  }

  // EDITAR (prompts simples)
  if (e.target.matches('[data-editar]')) {
    const id = e.target.getAttribute('data-editar');
    const tr = e.target.closest('tr');
    const nombre = prompt('Nombre:', tr.children[1].textContent);
    if (nombre === null) return;
    const correo = prompt('Correo:', tr.children[2].textContent);
    if (correo === null) return;
    const mensaje = prompt('Mensaje:', tr.children[3].textContent);
    if (mensaje === null) return;

    const res = await fetch(`${API}/inscripciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, mensaje })
    });
    const data = await res.json();
    alert(data.mensaje || data.error || 'Listo');
    cargar();
  }
});

cargar();
