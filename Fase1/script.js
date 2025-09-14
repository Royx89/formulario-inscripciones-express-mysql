document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const resultado = document.getElementById('resultado');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();//sin esta linea la pagina regaragaria al darle submit y no se mostrarias los datos que mandamos en la pagina ni en la terminal solo en un formulario del html pero no como JSON ni al endpoint correcto.

        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;
        const mensaje = document.getElementById('mensaje').value;

        // Envía los datos al backend
        try {
            const res = await fetch('http://localhost:3000/inscribir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, correo, mensaje }),
            });

            const data = await res.json();

            resultado.innerHTML = `
                <h3 style="color: green;">${data.mensaje}</h3>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Correo:</strong> ${correo}</p>
                <p><strong>Mensaje:</strong> ${mensaje}</p>
            `;
        } catch (error) {
            resultado.innerHTML = `<p style="color: red;">Error al enviar los datos: ${error.message}</p>`;
        }

        form.reset();
    });
});
