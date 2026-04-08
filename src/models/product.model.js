// Importamos la conexión a la base de datos.
const pool = require('../config/db');

// Este modelo consulta los productos para mostrarlos en el frontend.
const ProductModel = {
  // Lista todos los productos con su categoría.
  async findAll() {
    const query = `
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.categoria_id,
        c.nombre AS categoria_nombre,
        p.codigo_barras,
        p.estado,
        p.creado_en,
        p.actualizado_en
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      ORDER BY p.creado_en DESC, p.nombre ASC
    `;

    const { rows } = await pool.query(query);
    return rows;
  },

  // Crea un nuevo producto en la base de datos.
  async create({ nombre, descripcion, precio, stock, categoria_id, codigo_barras }) {
    const query = `
      INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, codigo_barras)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [nombre, descripcion || null, precio, stock || 0, categoria_id || null, codigo_barras || null];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Lista todas las categorías disponibles.
  async findAllCategories() {
    const query = `SELECT id, nombre FROM categorias ORDER BY nombre ASC`;
    const { rows } = await pool.query(query);
    return rows;
  },
};

// Exportamos el modelo.
module.exports = ProductModel;
