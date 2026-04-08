// Importamos la conexión a la base de datos.
const pool = require('../config/db');

// Este modelo maneja las consultas del módulo de usuarios.
const UserModel = {
  // Lista todos los usuarios con su rol.
  async findAll() {
    const query = `
      SELECT
        u.id,
        u.nombre,
        u.correo,
        u.estado,
        u.creado_en,
        r.nombre AS rol
      FROM usuarios u
      LEFT JOIN roles r ON r.id = u.rol_id
      ORDER BY u.creado_en DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
  },

  // Busca un usuario por id.
  async findById(id) {
    const query = `
      SELECT
        u.id,
        u.nombre,
        u.correo,
        u.estado,
        u.creado_en,
        r.nombre AS rol
      FROM usuarios u
      LEFT JOIN roles r ON r.id = u.rol_id
      WHERE u.id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  // Busca un usuario por correo.
  async findByEmail(correo) {
    const query = `
      SELECT
        id,
        nombre,
        correo,
        contrasena,
        rol_id,
        estado,
        creado_en
      FROM usuarios
      WHERE correo = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [correo]);
    return rows[0] || null;
  },

  // Actualiza nombre y correo del usuario.
  async update(id, { nombre, correo }) {
    const query = `
      UPDATE usuarios
      SET nombre = $1, correo = $2, actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, nombre, correo, estado, creado_en
    `;

    const { rows } = await pool.query(query, [nombre, correo, id]);
    return rows[0] || null;
  },

  // Elimina un usuario por id.
  async delete(id) {
    const query = `
      DELETE FROM usuarios
      WHERE id = $1
      RETURNING id
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },
};

// Exportamos el modelo.
module.exports = UserModel;
