const pool = require('../config/db');

const AuthModel = {
  async findAllRoles() {
    const query = `
      SELECT id, nombre
      FROM roles
      ORDER BY nombre ASC
    `;

    const { rows } = await pool.query(query);
    return rows;
  },

  async findUserByEmail(correo) {
    const query = `
      SELECT
        u.id,
        u.nombre,
        u.correo,
        u.contrasena,
        u.rol_id,
        u.estado,
        u.creado_en,
        r.nombre AS rol
      FROM usuarios u
      LEFT JOIN roles r ON r.id = u.rol_id
      WHERE u.correo = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [correo]);
    return rows[0] || null;
  },

  async findRoleByName(nombreRol) {
    const query = `
      SELECT id, nombre
      FROM roles
      WHERE nombre = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [nombreRol]);
    return rows[0] || null;
  },

  async createUser({ nombre, correo, contrasena, rol_id }) {
    const query = `
      INSERT INTO usuarios (nombre, correo, contrasena, rol_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, correo, rol_id, estado, creado_en
    `;

    const values = [nombre, correo, contrasena, rol_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async updatePassword(userId, hashedPassword) {
    const query = `
      UPDATE usuarios
      SET contrasena = $1, actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await pool.query(query, [hashedPassword, userId]);
  }
};

module.exports = AuthModel;
