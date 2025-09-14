const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true, salud: 'Servidor activo v2' }));

app.post(
  '/inscribir',
  [
    body('nombre').trim().isLength({ min: 2, max: 80 })
      .withMessage('El nombre debe tener entre 2 y 80 caracteres.'),
    body('correo').trim().isEmail()
      .withMessage('El correo no tiene un formato válido.')
      .isLength({ max: 120 }).withMessage('El correo es demasiado largo.'),
    body('mensaje').trim().isLength({ min: 10, max: 500 })
      .withMessage('El mensaje debe tener entre 10 y 500 caracteres.'),
  ],
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errores: errores.array().map(e => ({ campo: e.path, msg: e.msg })),
      });
    }

    const { nombre, correo, mensaje } = req.body;
    return res.status(200).json({
      ok: true,
      mensaje: 'Inscripción recibida correctamente.',
      data: { nombre, correo, mensaje },
    });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor v2 en http://localhost:${PORT}`));
