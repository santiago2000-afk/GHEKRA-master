import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import bcrypt from "bcrypt";

// Necesario para activar el modo "verbose" en SQLite3
const sqlite = sqlite3.verbose();

const app = express();
const PORT = 5000;
const SALT_ROUNDS = 10;

app.use(express.json());
app.use(cors());

// Conexión a la base de datos
const db = new sqlite.Database("./database.db", (err) => {
  if (err) console.error("Error al conectar con SQLite:", err.message);
  else console.log("Conectado a la base de datos SQLite.");
});

// Crear tablas al iniciar
db.serialize(() => {
  // Tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY CHECK(id > 0),
      nombre TEXT NOT NULL UNIQUE CHECK(
        LENGTH(nombre) >= 3 AND LENGTH(nombre) <= 50 AND 
        nombre GLOB '*[A-Za-z]*'
      ),
      password TEXT NOT NULL,
      fecha_creacion DATE DEFAULT CURRENT_DATE
    )
  `, (err) => {
    if (err) console.error("Error creando tabla usuarios:", err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS tarjetas (
      id INTEGER PRIMARY KEY AUTOINCREMENT CHECK(id > 0),
      dmc TEXT NOT NULL UNIQUE CHECK(
        LENGTH(dmc) > 0 AND 
        LENGTH(dmc) < 30 AND 
        dmc GLOB '*[0-9]*' AND 
        dmc GLOB '*[A-Za-z]*'
      ),
      familia TEXT NOT NULL CHECK(
        LENGTH(familia) >= 3 AND LENGTH(familia) <= 50 AND 
        familia GLOB '*[A-Za-z]*'
      ),
      linea TEXT NOT NULL CHECK(
        LENGTH(linea) >= 3 AND LENGTH(linea) <= 50 AND 
        linea GLOB '*[A-Za-z]*'
      ),
      fecha_creacion DATE DEFAULT CURRENT_DATE,
      contador INTEGER NOT NULL DEFAULT 0 CHECK(contador >= 0)
    )
  `, (err) => {
    if (err) console.error("Error creando tabla tarjetas:", err.message);
  });  

  // Tabla de historial de usos
  db.run(`
    CREATE TABLE IF NOT EXISTS historial_uso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tarjeta_id INTEGER NOT NULL,
      fecha_uso DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tarjeta_id) REFERENCES tarjetas (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error("Error creando tabla historial_uso:", err.message);
  });

  // Tabla de logs de auditoría
  db.run(`
    CREATE TABLE IF NOT EXISTS auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accion TEXT NOT NULL CHECK(
        accion IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')
      ),
      entidad TEXT NOT NULL CHECK(
        entidad IN ('usuarios', 'tarjetas', 'historial_uso')
      ),
      descripcion TEXT NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error("Error creando tabla auditoria:", err.message);
  });
});

// Función para registrar auditoría
const registrarAuditoria = (accion, entidad, descripcion) => {
  db.run(
    "INSERT INTO auditoria (accion, entidad, descripcion) VALUES (?, ?, ?)",
    [accion, entidad, descripcion],
    (err) => {
      if (err) console.error("Error registrando auditoría:", err.message);
    }
  );
};

// Rutas del servidor
app.get("/", (req, res) => res.send("Servidor en funcionamiento"));

// Registrar usuario con validación y hash de contraseña
app.post("/register", async (req, res) => {
  const { id, nombre, password } = req.body;
  if (!id || !nombre || !password) {
    return res.status(400).send("Todos los campos son obligatorios.");
  }
  if (password.length < 6) {
    return res.status(400).send("La contraseña debe tener al menos 6 caracteres.");
  }
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    db.run(
      "INSERT INTO usuarios (id, nombre, password) VALUES (?, ?, ?)",
      [id, nombre, hashedPassword],
      (err) => {
        if (err) return res.status(500).send(err.message);
        registrarAuditoria("INSERT", "usuarios", `Usuario ${nombre} registrado.`);
        res.send("Usuario registrado correctamente");
      }
    );
  } catch (err) {
    res.status(500).send("Error al procesar la solicitud.");
  }
});

// Obtener tarjetas con validación
app.get("/tarjetas", (req, res) => {
  db.all("SELECT * FROM tarjetas", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    if (rows.length === 0) return res.status(404).send("No se encontraron tarjetas.");
    res.json(rows);
  });
});

app.post("/tarjetas", (req, res) => {
  const { dmc, familia, linea } = req.body;

  // Validación de campos obligatorios
  if (!dmc || !familia || !linea) {
    return res.status(400).send("Todos los campos son obligatorios.");
  }

  db.run(
    "INSERT INTO tarjetas (dmc, familia, linea) VALUES (?, ?, ?)",
    [dmc, familia, linea],
    (err) => {
      if (err) {
        console.error("Error al registrar tarjeta:", err.message);
        return res.status(500).send(err.message);
      }

      // Si todo está bien, respuesta exitosa
      registrarAuditoria("INSERT", "tarjetas", `Tarjeta ${dmc} registrada.`);
      res.json({
        message: "Tarjeta perfiladora registrada correctamente",
        tarjetaId: this.lastID,  // Retorna el ID generado automáticamente
      });
    }
  );
});


// Incrementar contador con validación y registrar historial
app.post("/usar/:dmc", (req, res) => {
  const { dmc } = req.params;
  db.serialize(() => {
    db.get("SELECT id FROM tarjetas WHERE dmc = ?", [dmc], (err, row) => {
      if (err || !row) return res.status(404).send(err?.message || "Tarjeta no encontrada.");
      const tarjetaId = row.id;

      db.run(
        "UPDATE tarjetas SET contador = contador + 1 WHERE id = ?",
        [tarjetaId],
        (err) => {
          if (err) return res.status(500).send(err.message);
          db.run(
            "INSERT INTO historial_uso (tarjeta_id) VALUES (?)",
            [tarjetaId],
            (err) => {
              if (err) return res.status(500).send(err.message);
              registrarAuditoria("UPDATE", "tarjetas", `Contador incrementado para tarjeta ${dmc}.`);
              res.send("Contador actualizado correctamente");
            }
          );
        }
      );
    });
  });
});

// Iniciar servidor
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
