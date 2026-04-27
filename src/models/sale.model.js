// Importamos la conexión a la base de datos.
const pool = require('../config/db');

// Este modelo agrupa las consultas usadas en el módulo de ventas.
const SaleModel = {
  // Busca productos activos y permite filtrar por texto.
  async findProducts(filters = {}) {
    const { search = '' } = filters;
    // values guarda los parámetros seguros para la consulta SQL.
    const values = [];
    // Por defecto solo mostramos productos activos.
    const where = ['p.estado = true'];

    if (search.trim()) {
      // Si el usuario escribió algo, buscamos por nombre, código o categoría.
      values.push(`%${search.trim()}%`);
      where.push(`(
        p.nombre ILIKE $${values.length}
        OR p.codigo_barras ILIKE $${values.length}
        OR COALESCE(c.nombre, '') ILIKE $${values.length}
      )`);
    }

    // Esta consulta devuelve los campos que la vista de ventas necesita.
    const query = `
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.imagen_url,
        p.precio,
        p.stock,
        p.codigo_barras,
        p.estado,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE ${where.join(' AND ')}
      ORDER BY p.nombre ASC
    `;

    // Ejecutamos la consulta y devolvemos solo las filas.
    const { rows } = await pool.query(query, values);
    return rows;
  },
};

// Exportamos el modelo para usarlo desde el controlador.
module.exports = SaleModel;
