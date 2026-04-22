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
        p.imagen_url,
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
  async create({ nombre, descripcion, imagen_url, precio, stock, categoria_id, codigo_barras }) {
    const query = `
      INSERT INTO productos (nombre, descripcion, imagen_url, precio, stock, categoria_id, codigo_barras)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      nombre,
      descripcion || null,
      imagen_url || null,
      precio,
      stock || 0,
      categoria_id || null,
      codigo_barras || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Lista todas las categorías disponibles.
  async findAllCategories() {
    const query = `SELECT id, nombre FROM categorias ORDER BY nombre ASC`;
    const { rows } = await pool.query(query);
    return rows;
  },

  // Busca un producto por su identificador.
  async findById(id) {
    const query = `
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.imagen_url,
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
      WHERE p.id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  // Actualiza los datos editables de un producto.
  async updateById(id, { nombre, descripcion, imagen_url, precio, stock, codigo_barras, estado }) {
    const query = `
      UPDATE productos
      SET
        nombre = $2,
        descripcion = $3,
        imagen_url = $4,
        precio = $5,
        stock = $6,
        codigo_barras = $7,
        estado = $8,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    const values = [id, nombre, descripcion, imagen_url || null, precio, stock, codigo_barras, estado];
    const { rows } = await pool.query(query, values);

    if (!rows[0]) {
      return null;
    }

    return this.findById(id);
  },
};

// Exportamos el modelo.
module.exports = ProductModel;
