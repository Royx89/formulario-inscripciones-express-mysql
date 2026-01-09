// Fase3/lista.js

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#tbl tbody');

  // --------------------------
  //   CARGAR TABLA DESDE API
  // --------------------------
  async function cargarTabla() {
    try {
      const resp = await fetch('/listar');
      if (!resp.ok) throw new Error('Error HTTP al listar');
      const data = await resp.json();

      tbody.innerHTML = '';

      (data.data || []).forEach(reg => {
        const tr = document.createElement('tr');

        const tdId       = document.createElement('td');
        const tdNombre   = document.createElement('td');
        const tdCorreo   = document.createElement('td');
        const tdMensaje  = document.createElement('td');
        const tdFecha    = document.createElement('td');
        const tdAcciones = document.createElement('td');

        tdId.textContent      = reg.id;
        tdNombre.textContent  = reg.nombre;
        tdCorreo.textContent  = reg.correo;
        tdMensaje.textContent = reg.mensaje;
        tdFecha.textContent   = new Date(reg.fecha).toLocaleString('es-MX');

        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btn-editar');
        btnEditar.dataset.id = reg.id;
        btnEditar.dataset.accion = 'editar';

        const btnBorrar = document.createElement('button');
        btnBorrar.textContent = 'Borrar';
        btnBorrar.classList.add('btn-danger');
        btnBorrar.dataset.id = reg.id;
        btnBorrar.dataset.accion = 'borrar';

        tdAcciones.appendChild(btnEditar);
        tdAcciones.appendChild(btnBorrar);

        tr.appendChild(tdId);
        tr.appendChild(tdNombre);
        tr.appendChild(tdCorreo);
        tr.appendChild(tdMensaje);
        tr.appendChild(tdFecha);
        tr.appendChild(tdAcciones);

        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error al cargar tabla:', err);
      alert('No se pudieron cargar las inscripciones.');
    }
  }

  // --------------------------
  //   EDITAR / BORRAR (CRUD)
  // --------------------------
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;
    const accion = btn.dataset.accion;

    // BORRAR
    if (accion === 'borrar') {
      const ok = confirm('¿Seguro que deseas borrar esta inscripción?');
      if (!ok) return;

      try {
        const resp = await fetch(`http://localhost:3000/inscripciones/${id}`, {
          method: 'DELETE'
        });
        const data = await resp.json();
        if (!resp.ok || data.ok === false) {
          console.error('Error al borrar:', data);
          alert('No se pudo borrar el registro.');
          return;
        }
        await cargarTabla();
      } catch (err) {
        console.error('Error de red al borrar:', err);
        alert('Error de red al borrar el registro.');
      }
    }

    // EDITAR
    if (accion === 'editar') {
      const fila = btn.closest('tr');
      const actualNombre  = fila.children[1].textContent;
      const actualCorreo  = fila.children[2].textContent;
      const actualMensaje = fila.children[3].textContent;

      const nuevoNombre = prompt('Nuevo nombre:', actualNombre);
      if (nuevoNombre === null) return;

      const nuevoCorreo = prompt('Nuevo correo:', actualCorreo);
      if (nuevoCorreo === null) return;

      const nuevoMensaje = prompt('Nuevo mensaje:', actualMensaje);
      if (nuevoMensaje === null) return;

      try {
        const resp = await fetch(`http://localhost:3000/inscripciones/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nuevoNombre.trim(),
            correo: nuevoCorreo.trim(),
            mensaje: nuevoMensaje.trim()
          })
        });
        const data = await resp.json();
        if (!resp.ok || data.ok === false) {
          console.error('Error al actualizar:', data);
          alert('No se pudo actualizar el registro.');
          return;
        }
        await cargarTabla();
      } catch (err) {
        console.error('Error de red al actualizar:', err);
        alert('Error de red al actualizar el registro.');
      }
    }
  });

  // --------------------------
  //   MODAL "AÑADIR INSCRIPCIÓN"
  // --------------------------
  const modal      = document.getElementById('modal-inscripcion');
  const btnAbrir   = document.getElementById('btn-abrir-modal');
  const btnCerrar  = document.getElementById('cerrar-modal');
  const formAgregar = document.getElementById('form-agregar');

  if (btnAbrir && modal && btnCerrar && formAgregar) {
    // Abrir
    btnAbrir.addEventListener('click', () => {
      modal.classList.add('modal-activo');
    });

    // Cerrar por botón X
    btnCerrar.addEventListener('click', () => {
      modal.classList.remove('modal-activo');
    });

    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('modal-activo');
      }
    });

    // Enviar nueva inscripción desde el modal
    formAgregar.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre  = document.getElementById('nuevoNombre').value.trim();
      const correo  = document.getElementById('nuevoCorreo').value.trim();
      const mensaje = document.getElementById('nuevoMensaje').value.trim();

      if (!nombre || !correo || mensaje.length < 10) {
        alert('Completa todos los campos. El mensaje debe tener al menos 10 caracteres.');
        return;
      }

      try {
        const resp = await fetch('http://localhost:3000/inscribir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, correo, mensaje })
        });

        const data = await resp.json();

        if (!resp.ok || data.ok === false) {
          console.error('Error al guardar:', data);
          alert('No se pudo guardar la inscripción.');
          return;
        }

        formAgregar.reset();
        modal.classList.remove('modal-activo');
        await cargarTabla();
      } catch (err) {
        console.error(err);
        alert('Error de conexión con el servidor.');
      }
    });
  }

  // Cargar tabla al entrar
  cargarTabla();
});
