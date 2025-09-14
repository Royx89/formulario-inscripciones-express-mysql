const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
const uri = 'mongodb+srv://Royx89:Asta%401989@cluster0.qlcnfz4.mongodb.net/miapp?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectar a MongoDB', err));

// Modelo de inscripción
const inscripcionSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    mensaje: { type: String, required: true }
});
//aqui le decimos como deben ser los datos que guardamos en Mongoose

const Inscripcion = mongoose.model('Inscripcion', inscripcionSchema);

// Ruta GET
app.get('/', (req, res) => {
    res.send('¡Servidor Express funcionando!');
});

// Ruta POST para guardar en MongoDB Atlas
app.post('/inscribir', async (req, res) => {
    const { nombre, correo, mensaje } = req.body;
    try {
        const nuevaInscripcion = new Inscripcion({ nombre, correo, mensaje });
        await nuevaInscripcion.save();
        console.log('¡Guardado en MongoDB!', nuevaInscripcion); // <-- Agrega esto
        res.json({ status: 'ok', mensaje: '¡Datos guardados en MongoDB!' });
    } catch (error) {
        console.error('Error al guardar inscripción:', error);
        res.status(500).json({ status: 'error', mensaje: 'Error al guardar datos.' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
