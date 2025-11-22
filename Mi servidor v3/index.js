// Mi servidor v3/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const pool = require('./db');
const path = require('path');          // 👈 NUEVO

const app = express();

app.use(cors());
app.use(express.json());

// 👇 RUTA ESTÁTICA CORRECTA A ../Fase3
// Carpeta del servidor:  I:\Documentos\html curso\Mi servidor v3
// Carpeta del front:     I:\Documentos\html curso\Fase3
const staticPath = path.join(__dirname, '..', 'Fase3');
app.use(express.static(staticPath));   // 👈 Sirve lista.html, estilos.css, lista.js

// 🟢 Opcional: que /lista sirva directamente la página HTML
app.get('/lista', (_req, res) => {
  res.sendFile(path.join(staticPath, 'lista.html'));
});

// Salud del servidor
app.get('/', (_req, res) => {
  res.sendFile(path.join(staticPath, 'lista.html'));
});


// CREATE (POST)
app.post(
  '/inscribir',
  [
    body('nombre').trim().isLength({ min: 2, max: 80 }).withMessage('Nombre 2–80.'),
    body('correo').trim().isEmail().withMessage('Correo inválido.')
                  .isLength({ max: 120 }).withMessage('Correo muy largo.'),
    body('mensaje').trim().isLength({ min: 10, max: 500 }).withMessage('Mensaje 10–500.'),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errores: errores.array().map(e => ({ campo: e.path, msg: e.msg })),
      });
    }

    const { nombre, correo, mensaje } = req.body;
    try {
      await pool.execute(
        'INSERT INTO inscripciones (nombre, correo, mensaje) VALUES (?, ?, ?)',
        [nombre, correo, mensaje]
      );
      res.json({ ok: true, mensaje: 'Inscripción guardada en DB.' });
    } catch (err) {
      console.error('DB insert error:', err);
      res.status(500).json({ ok: false, error: 'Error al guardar en la base de datos.' });
    }
  }
);

// READ (GET)
app.get('/listar', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, correo, mensaje, fecha FROM inscripciones ORDER BY id DESC'
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('DB select error:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener registros.' });
  }
});

// UPDATE (PUT)
app.put(
  '/inscripciones/:id',
  [
    param('id').isInt().withMessage('id inválido'),
    body('nombre').trim().isLength({ min: 2, max: 80 }).withMessage('Nombre 2–80.'),
    body('correo').trim().isEmail().withMessage('Correo inválido.')
                  .isLength({ max: 120 }).withMessage('Correo muy largo.'),
    body('mensaje').trim().isLength({ min: 10, max: 500 }).withMessage('Mensaje 10–500.'),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errores: errores.array().map(e => ({ campo: e.path, msg: e.msg })),
      });
    }

    const id = parseInt(req.params.id, 10);
    const { nombre, correo, mensaje } = req.body;

    try {
      const [result] = await pool.execute(
        'UPDATE inscripciones SET nombre=?, correo=?, mensaje=? WHERE id=?',
        [nombre, correo, mensaje, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: 'No existe ese id.' });
      }
      res.json({ ok: true, mensaje: 'Inscripción actualizada.' });
    } catch (err) {
      console.error('DB update error:', err);
      res.status(500).json({ ok: false, error: 'Error al actualizar.' });
    }
  }
);

// DELETE (DELETE)
app.delete(
  '/inscripciones/:id',
  [param('id').isInt().withMessage('id inválido')],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errores: errores.array().map(e => ({ campo: e.path, msg: e.msg })),
      });
    }

    const id = parseInt(req.params.id, 10);

    try {
      const [result] = await pool.execute(
        'DELETE FROM inscripciones WHERE id=?',
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: 'No existe ese id.' });
      }
      res.json({ ok: true, mensaje: 'Inscripción eliminada.' });
    } catch (err) {
      console.error('DB delete error:', err);
      res.status(500).json({ ok: false, error: 'Error al eliminar.' });
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor v3 en http://localhost:${PORT}`));
