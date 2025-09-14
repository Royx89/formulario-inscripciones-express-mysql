document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const resultado = document.getElementById('resultado');
  if (!form || !resultado) return;

  const emailValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  // Helper para pintar listas de mensajes de forma segura
  function renderLista(titulo, mensajes, color) {
    resultado.innerHTML = '';
    const h3 = document.createElement('h3');
    h3.style.color = color || '#333';
    h3.style.margin = '0 0 8px';
    h3.textContent = titulo;

    const ul = document.createElement('ul');
    ul.style.paddingLeft = '16px';
    ul.style.margin = '0';

    mensajes.forEach(msg => {
      const li = document.createElement('li');
      li.textContent = String(msg);
      ul.appendChild(li);
    });

    resultado.appendChild(h3);
    resultado.appendChild(ul);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Referencias a inputs
    const iNombre  = document.getElementById('nombre');
    const iCorreo  = document.getElementById('correo');
    const iMensaje = document.getElementById('mensaje');

    // Valores (con fallback por si falta algún input)
    const nombre  = (iNombre?.value ?? '').trim();
    const correo  = (iCorreo?.value ?? '').trim();
    const mensaje = (iMensaje?.value ?? '').trim();

    // Limpia estilos de error anteriores
    [iNombre, iCorreo, iMensaje].forEach(el => el && el.classList.remove('input-error'));

    // Validaciones
    const errores = [];
    if (nombre.length < 2) {
      errores.push('El nombre debe tener al menos 2 caracteres.');
      iNombre && iNombre.classList.add('input-error');
    }
    if (!emailValido(correo)) {
      errores.push('El correo no tiene un formato válido.');
      iCorreo && iCorreo.classList.add('input-error');
    }
    if (mensaje.length < 10) {
      errores.push('El mensaje debe tener al menos 10 caracteres.');
      iMensaje && iMensaje.classList.add('input-error');
    }

    // Si hay errores, muéstralos y NO envíes al backend
    if (errores.length > 0) {
      renderLista('Corrige estos campos:', errores, '#b00020');
      const firstInvalid = [iNombre, iCorreo, iMensaje].find(el => el && el.classList.contains('input-error'));
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Bloquear doble envío
    const btn = form.querySelector('button[type="submit"]');
    const oldText = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Enviando…';
    }

    // Envío al backend
    try {
      const res = await fetch('http://localhost:3000/inscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, mensaje }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msgs = (data && Array.isArray(data.errores))
          ? data.errores.map(x => x.msg || String(x))
          : ['Error desconocido del servidor.'];
        renderLista('No se pudo enviar:', msgs, '#b00020');
        return;
      }

      // Éxito (sin inyectar HTML del usuario)
      resultado.innerHTML = `
        <h3 style="color: green;" id="ok-msg"></h3>
        <p><strong>Nombre:</strong> <span id="r-nombre"></span></p>
        <p><strong>Correo:</strong> <span id="r-correo"></span></p>
        <p><strong>Mensaje:</strong> <span id="r-mensaje"></span></p>
      `;
      document.getElementById('ok-msg').textContent   = data.mensaje || 'Inscripción recibida correctamente.';
      document.getElementById('r-nombre').textContent = nombre;
      document.getElementById('r-correo').textContent = correo;
      document.getElementById('r-mensaje').textContent= mensaje;

      form.reset();
    } catch (error) {
      resultado.innerHTML = '';
      const p = document.createElement('p');
      p.style.color = 'red';
      p.textContent = `Error al enviar los datos: ${error.message}`;
      resultado.appendChild(p);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = oldText;
      }
    }
  });
});
