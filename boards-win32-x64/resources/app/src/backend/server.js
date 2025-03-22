import express from 'express';
import rolesRoutes from './routes/rolesRoutes.js';
import tarjetasRoutes from './routes/tarjetasRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import authRoutes from './routes/authRoutes.js';
import sqlite3 from "sqlite3";
import bcrypt from 'bcryptjs';
import cors from 'cors';
import jwt from 'jsonwebtoken';  // Importar jsonwebtoken

const SALT_ROUNDS = 10;  // Definir SALT_ROUNDS

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("Error al conectar con SQLite:", err.message);
  else console.log("✅ Conectado a la base de datos SQLite.");
});

// Crear tablas al iniciar
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT CHECK(id > 0),
      nombre TEXT NOT NULL UNIQUE CHECK(
        LENGTH(nombre) >= 3 AND LENGTH(nombre) <= 50 AND 
        nombre GLOB '*[A-Za-z]*'
      )
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      nombre TEXT NOT NULL UNIQUE CHECK(
        LENGTH(nombre) >= 3 AND LENGTH(nombre) <= 50 AND 
        nombre GLOB '*[A-Za-z]*'
      ),
      password TEXT NOT NULL,
      fecha_creacion DATE DEFAULT CURRENT_DATE,
      role_id INTEGER NOT NULL DEFAULT 2,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET DEFAULT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS familias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE CHECK(
        LENGTH(nombre) >= 3 AND LENGTH(nombre) <= 50 AND 
        nombre GLOB '*[A-Za-z]*'
      )
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS lineas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE CHECK(
        LENGTH(nombre) >= 3 AND LENGTH(nombre) <= 50 AND 
        nombre GLOB '*[A-Za-z]*'
      ),
      familia_id INTEGER NOT NULL,
      FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tarjetas (
      id INTEGER PRIMARY KEY AUTOINCREMENT CHECK(id > 0),
      dmc TEXT NOT NULL UNIQUE CHECK(
        LENGTH(dmc) >= 6 AND LENGTH(dmc) < 30 AND 
        dmc GLOB '*[A-Za-z0-9]*'
      ),
      familia_id INTEGER NOT NULL,
      linea_id INTEGER NOT NULL,
      fecha_creacion DATE DEFAULT CURRENT_DATE,
      contador INTEGER NOT NULL DEFAULT 0 CHECK(contador >= 0),
      FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE,
      FOREIGN KEY (linea_id) REFERENCES lineas(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS historial_uso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tarjeta_id INTEGER NOT NULL,
      fecha_uso DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tarjeta_id) REFERENCES tarjetas (id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accion TEXT NOT NULL CHECK(
        accion IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')
      ),
      entidad TEXT NOT NULL CHECK(
        entidad IN ('usuarios', 'tarjetas', 'historial_uso', 'roles')
      ),
      descripcion TEXT NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Endpoint de registro de usuario
app.post('/api/auth/register', async (req, res) => {
  const { nombre, password, role_id } = req.body;

  // Validación de los campos requeridos
  if (!nombre || !password || !role_id) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    // Encriptar la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuarios (nombre, password, role_id)
      VALUES (?, ?, ?)
    `;

    // Ejecutar la consulta para insertar el usuario
    db.run(query, [nombre, hashedPassword, role_id], function (err) {
      if (err) {
        console.error("Error al registrar el usuario:", err.message);
        return res.status(500).json({ error: 'Hubo un error al registrar el usuario.' });
      }

      // Responder con un mensaje de éxito y el ID del nuevo usuario
      return res.status(201).json({
        message: 'Usuario registrado con éxito.',
        userId: this.lastID,
      });
    });
  } catch (error) {
    // Manejo de errores de encriptación o cualquier otro problema
    console.error("Error al encriptar la contraseña:", error.message);
    return res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});

// Endpoint de inicio de sesión (login)
app.post('/api/auth/login', async (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const query = 'SELECT * FROM usuarios WHERE nombre = ?';
  db.get(query, [nombre], async (err, user) => {
    if (err) {
      console.error("Error al consultar el usuario:", err.message);
      return res.status(500).json({ error: 'Error al buscar el usuario.' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, role_id: user.role_id },
      'secretkey',  // Debe ser una clave secreta que solo tu servidor conozca
      { expiresIn: '1h' }  // El token expirará en 1 hora
    );

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        role_id: user.role_id,
      },
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  return res.status(200).json({
    message: 'Sesión cerrada con éxito',
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

// Obtener tarjetas con el campo 'contador' renombrado como 'veces_usada'
app.get("/tarjetas", (req, res) => {
  db.all("SELECT id, dmc, familia, linea, fecha_creacion, contador AS veces_usada FROM tarjetas", [], (err, rows) => {
    if (err) return res.status(500).send("Error al obtener las tarjetas.");
    if (rows.length === 0) return res.status(404).send("No se encontraron tarjetas.");
    res.json(rows);
  });
});

// Registrar o actualizar tarjeta (y reiniciar contador si ya existe)
app.post("/tarjetas", (req, res) => {
  const { dmc, familia, linea } = req.body;

  // Validación avanzada de los campos
  if (!dmc || !familia || !linea) {
    return res.status(400).send("Todos los campos son obligatorios.");
  }

  // Verificar si ya existe una tarjeta con el mismo 'dmc' y 'familia'
  db.get("SELECT id FROM tarjetas WHERE dmc = ? AND familia = ?", [dmc, familia], (err, row) => {
    if (err) return res.status(500).send("Error al verificar la tarjeta.");

    if (row) {
      // Si la tarjeta ya existe, se reinicia el contador a 0
      db.run("UPDATE tarjetas SET contador = 0 WHERE id = ?", [row.id], (err) => {
        if (err) return res.status(500).send("Error al actualizar la tarjeta.");
        registrarAuditoria("UPDATE", "tarjetas", `Contador de tarjeta ${dmc} (familia: ${familia}) reiniciado.`);
        res.json({ message: `Tarjeta ${dmc} (familia: ${familia}) ya existía, contador reiniciado a 0.` });
      });
    } else {
      // Si la tarjeta no existe, se registra una nueva tarjeta
      db.run(
        "INSERT INTO tarjetas (dmc, familia, linea) VALUES (?, ?, ?)",
        [dmc, familia, linea],
        function (err) {
          if (err) return res.status(500).send("Error interno al registrar la tarjeta.");
          registrarAuditoria("INSERT", "tarjetas", `Tarjeta ${dmc} (familia: ${familia}) registrada.`);
          res.json({ message: "Tarjeta registrada correctamente", tarjetaId: this.lastID });
        }
      );
    }
  });
});

// Actualizar tarjeta por ID
app.put("/tarjetas/:id", (req, res) => {
  const { id } = req.params;
  const { dmc, familia, linea } = req.body;

  // Validación avanzada de los campos
  if (!dmc || !familia || !linea) {
    return res.status(400).send("Todos los campos son obligatorios.");
  }

  db.run(
    "UPDATE tarjetas SET dmc = ?, familia = ?, linea = ? WHERE id = ?",
    [dmc, familia, linea, id],
    function (err) {
      if (err) return res.status(500).send("Error al actualizar la tarjeta.");
      if (this.changes === 0) return res.status(404).send("Tarjeta no encontrada.");
      registrarAuditoria("UPDATE", "tarjetas", `Tarjeta con ID ${id} actualizada.`);
      res.send("Tarjeta actualizada correctamente.");
    }
  );
});

// Eliminar tarjeta por ID
app.delete("/tarjetas/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM tarjetas WHERE id = ?",
    [id],
    function (err) {
      if (err) return res.status(500).send("Error al eliminar la tarjeta.");
      if (this.changes === 0) return res.status(404).send("Tarjeta no encontrada.");
      registrarAuditoria("DELETE", "tarjetas", `Tarjeta con ID ${id} eliminada.`);
      res.send("Tarjeta eliminada correctamente.");
    }
  );
});


// Incrementar contador y registrar en historial con transacción
app.post("/usar/:dmc", (req, res) => {
  const { dmc } = req.params;

  db.serialize(() => {
    db.get("SELECT id FROM tarjetas WHERE dmc = ?", [dmc], (err, row) => {
      if (err) return res.status(500).send("Error al buscar la tarjeta.");
      if (!row) return res.status(404).send("Tarjeta no encontrada.");

      const tarjetaId = row.id;

      db.run("BEGIN TRANSACTION");
      db.run("UPDATE tarjetas SET contador = contador + 1 WHERE id = ?", [tarjetaId], (err) => {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).send("Error al actualizar el contador.");
        }

        db.run("INSERT INTO historial_uso (tarjeta_id) VALUES (?)", [tarjetaId], (err) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).send("Error al registrar el uso de la tarjeta.");
          }

          db.run("COMMIT");
          registrarAuditoria("UPDATE", "tarjetas", `Contador incrementado para tarjeta ${dmc}.`);
          res.send("Contador actualizado correctamente.");
        });
      });
    });
  });
});

// Endpoint para mostrar todos los usuarios
app.get("/usuarios", (req, res) => {
  db.all("SELECT id, nombre, role_id FROM usuarios", [], (err, rows) => {
    if (err) return res.status(500).send("Error al obtener los usuarios.");
    if (rows.length === 0) return res.status(404).send("No se encontraron usuarios.");
    res.json(rows);
  });
});

// Endpoint para obtener roles
app.get("/roles", (req, res) => {
  db.all("SELECT id, nombre FROM roles", [], (err, rows) => {
    if (err) return res.status(500).send("Error al obtener los roles.");
    res.json(rows);
  });
});

// Endpoint para asignar rol a usuario
app.put("/usuarios/:id/role", (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body;

  // Validación del rol
  if (!role_id) {
    return res.status(400).send("El rol es obligatorio.");
  }

  db.run(
    "UPDATE usuarios SET role_id = ? WHERE id = ?",
    [role_id, id],
    (err) => {
      if (err) return res.status(500).send("Error al asignar el rol.");
      registrarAuditoria("UPDATE", "usuarios", `Rol actualizado para usuario con ID ${id}.`);
      res.send("Rol actualizado correctamente.");
    }
  );
});

// Endpoint para registrar un nuevo usuario
app.post("/usuarios", async (req, res) => {
  const { nombre, password, role_id } = req.body;

  // Validación de los campos
  if (!nombre || !password || !role_id) {
    return res.status(400).send("Todos los campos son obligatorios (nombre, password, role_id).");
  }

  if (nombre.length < 3 || nombre.length > 50 || !/^[A-Za-z]+$/.test(nombre)) {
    return res.status(400).send("El nombre debe tener entre 3 y 50 caracteres y solo puede contener letras.");
  }

  if (password.length < 6) {
    return res.status(400).send("La contraseña debe tener al menos 6 caracteres.");
  }

  try {
    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insertar el usuario en la base de datos
    db.run(
      "INSERT INTO usuarios (nombre, password, role_id) VALUES (?, ?, ?)", 
      [nombre, hashedPassword, role_id],
      function (err) {
        if (err) {
          return res.status(500).send("Error al registrar el usuario.");
        }
        registrarAuditoria("INSERT", "usuarios", `Usuario ${nombre} registrado.`);
        res.status(201).send({
          message: "Usuario registrado correctamente",
          usuarioId: this.lastID
        });
      }
    );
  } catch (err) {
    res.status(500).send("Error al procesar la solicitud.");
  }
});

// Endpoint para agregar una nueva familia
app.post("/familias", (req, res) => {
  const { nombre } = req.body;

  // Insertar la nueva familia en la base de datos
  db.run(
    "INSERT INTO familias (nombre) VALUES (?)",
    [nombre],
    function (err) {
      if (err) {
        return res.status(500).send("Error al registrar la familia.");
      }
      registrarAuditoria("INSERT", "familias", `Familia ${nombre} registrada.`);
      res.status(201).send({
        message: "Familia registrada correctamente",
        familiaId: this.lastID,
      });
    }
  );
});

// Endpoint para editar una familia
app.put("/familias/:id", (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  // Actualizar la familia en la base de datos
  db.run(
    "UPDATE familias SET nombre = ? WHERE id = ?",
    [nombre, id],
    function (err) {
      if (err) {
        return res.status(500).send("Error al actualizar la familia.");
      }
      if (this.changes === 0) {
        return res.status(404).send("Familia no encontrada.");
      }
      registrarAuditoria("UPDATE", "familias", `Familia con ID ${id} actualizada a ${nombre}.`);
      res.send("Familia actualizada correctamente.");
    }
  );
});

// Endpoint para eliminar una familia
app.delete("/familias/:id", (req, res) => {
  const { id } = req.params;

  // Eliminar la familia de la base de datos
  db.run(
    "DELETE FROM familias WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).send("Error al eliminar la familia.");
      }
      if (this.changes === 0) {
        return res.status(404).send("Familia no encontrada.");
      }
      registrarAuditoria("DELETE", "familias", `Familia con ID ${id} eliminada.`);
      res.send("Familia eliminada correctamente.");
    }
  );
});

// Endpoint para obtener todas las familias
app.get("/familias", (req, res) => {
  db.all("SELECT id, nombre FROM familias", [], (err, rows) => {
    if (err) return res.status(500).send("Error al obtener las familias.");
    if (rows.length === 0) return res.status(404).send("No se encontraron familias.");
    res.json(rows);
  });
});


// Endpoint para obtener todas las líneas
app.get("/lineas", (req, res) => {
  db.all("SELECT id, nombre, familia_id FROM lineas", [], (err, rows) => {
    if (err) return res.status(500).send("Error al obtener las líneas.");
    if (rows.length === 0) return res.status(404).send("No se encontraron líneas.");
    res.json(rows);
  });
});

// Endpoint para agregar una nueva línea
app.post("/lineas", (req, res) => {
  const { nombre, familia_id } = req.body;

  // Validación de los campos
  if (!nombre || nombre.length < 3 || nombre.length > 50 || !/^[A-Za-z]+$/.test(nombre)) {
    return res.status(400).send("El nombre de la línea debe tener entre 3 y 50 caracteres y solo puede contener letras.");
  }
  if (!familia_id) {
    return res.status(400).send("El ID de la familia es obligatorio.");
  }

  // Insertar la nueva línea en la base de datos
  db.run(
    "INSERT INTO lineas (nombre, familia_id) VALUES (?, ?)",
    [nombre, familia_id],
    function (err) {
      if (err) {
        return res.status(500).send("Error al registrar la línea.");
      }
      registrarAuditoria("INSERT", "lineas", `Línea ${nombre} registrada en familia con ID ${familia_id}.`);
      res.status(201).send({
        message: "Línea registrada correctamente",
        lineaId: this.lastID,
      });
    }
  );
});

// Endpoint para editar una línea
app.put("/lineas/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, familia_id } = req.body;

  // Actualizar la línea en la base de datos
  db.run(
    "UPDATE lineas SET nombre = ?, familia_id = ? WHERE id = ?",
    [nombre, familia_id, id],
    function (err) {
      if (err) {
        return res.status(500).send("Error al actualizar la línea.");
      }
      if (this.changes === 0) {
        return res.status(404).send("Línea no encontrada.");
      }
      registrarAuditoria("UPDATE", "lineas", `Línea con ID ${id} actualizada a ${nombre} en familia con ID ${familia_id}.`);
      res.send("Línea actualizada correctamente.");
    }
  );
});

// Endpoint para eliminar una línea
app.delete("/lineas/:id", (req, res) => {
  const { id } = req.params;

  // Eliminar la línea de la base de datos
  db.run(
    "DELETE FROM lineas WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).send("Error al eliminar la línea.");
      }
      if (this.changes === 0) {
        return res.status(404).send("Línea no encontrada.");
      }
      registrarAuditoria("DELETE", "lineas", `Línea con ID ${id} eliminada.`);
      res.send("Línea eliminada correctamente.");
    }
  );
});

// Usar rutas
app.use('/api/roles', rolesRoutes);
app.use('/api/tarjetas', tarjetasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);


// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor en ejecución en http://localhost:${port}`);
});

export default db;
