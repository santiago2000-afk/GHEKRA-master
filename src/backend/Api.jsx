// config/database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Error al conectar con SQLite:', err.message);
  else console.log('Conectado a la base de datos SQLite.');
});

module.exports = db;

// controllers/tarjetasController.js
const db = require('../config/database');

const tarjetasController = {
  // Obtener todas las tarjetas
  getAllTarjetas: (req, res) => {
    db.all("SELECT * FROM tarjetas ORDER BY fecha_creacion DESC", [], (err, tarjetas) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ tarjetas });
    });
  },

  // Obtener una tarjeta por DMC
  getTarjetaByDMC: (req, res) => {
    const { dmc } = req.params;
    db.get("SELECT * FROM tarjetas WHERE dmc = ?", [dmc], (err, tarjeta) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tarjeta) return res.status(404).json({ error: "Tarjeta no encontrada" });
      res.json({ tarjeta });
    });
  },

  // Crear nueva tarjeta
createTarjeta: (req, res) => {
  // Obtener los datos del cuerpo de la solicitud
  const { dmc, familia, linea } = req.body;
  console.log(req.body);  // Muestra lo que recibes en el servidor (esto es solo para debug)

  // Validar que los campos no estén vacíos
  if (!dmc || !familia || !linea) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  // Insertar los datos en la base de datos sin pasar el 'id' (ya que es autoincrementable)
  db.run(
    "INSERT INTO tarjetas (dmc, familia, linea) VALUES (?, ?, ?)",  // No incluimos 'id' aquí
    [dmc, familia, linea],  // Pasamos solo los valores de los campos no autoincrementables
    function(err) {
      if (err) {
        console.error("Error al crear la tarjeta:", err.message); // Agregar mensaje de error para depuración
        return res.status(500).json({ error: err.message });
      }

      // Respuesta exitosa con el id generado automáticamente
      res.json({
        message: "Tarjeta creada exitosamente",
        tarjetaId: this.lastID  // 'lastID' devuelve el ID generado automáticamente
      });
    }
  );
},


  // Actualizar tarjeta
  updateTarjeta: (req, res) => {
    const { dmc } = req.params;
    const { familia, linea } = req.body;

    db.run(
      `UPDATE tarjetas 
       SET familia = COALESCE(?, familia), 
           linea = COALESCE(?, linea)
       WHERE dmc = ?`,
      [familia, linea, dmc],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Tarjeta no encontrada" });
        res.json({ message: "Tarjeta actualizada exitosamente" });
      }
    );
  },

  // Incrementar contador de uso
  incrementarUso: (req, res) => {
    const { dmc } = req.params;
    
    db.serialize(() => {
      db.get("SELECT id FROM tarjetas WHERE dmc = ?", [dmc], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Tarjeta no encontrada" });

        const tarjetaId = row.id;
        
        db.run(
          "UPDATE tarjetas SET contador = contador + 1 WHERE id = ?",
          [tarjetaId],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.run(
              "INSERT INTO historial_uso (tarjeta_id) VALUES (?)",
              [tarjetaId],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ 
                  message: "Uso registrado exitosamente",
                  tarjetaId: tarjetaId
                });
              }
            );
          }
        );
      });
    });
  },

  // Obtener historial de uso de una tarjeta
  getHistorialUso: (req, res) => {
    const { dmc } = req.params;
    
    db.all(
      `SELECT h.fecha_uso, t.dmc
       FROM historial_uso h
       JOIN tarjetas t ON h.tarjeta_id = t.id
       WHERE t.dmc = ?
       ORDER BY h.fecha_uso DESC`,
      [dmc],
      (err, historial) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ historial });
      }
    );
  }
};

// routes/tarjetasRoutes.js
const express = require('express');
const router = express.Router();
const tarjetasController = require('../controllers/tarjetasController');

// Rutas de tarjetas
router.get('/', tarjetasController.getAllTarjetas);
router.get('/:dmc', tarjetasController.getTarjetaByDMC);
router.post('/', tarjetasController.createTarjeta);
router.put('/:dmc', tarjetasController.updateTarjeta);
router.post('/:dmc/usar', tarjetasController.incrementarUso);
router.get('/:dmc/historial', tarjetasController.getHistorialUso);

module.exports = router;

// server.js
const express = require('express');
const cors = require('cors');
const tarjetasRoutes = require('./routes/tarjetasRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/tarjetas', tarjetasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});