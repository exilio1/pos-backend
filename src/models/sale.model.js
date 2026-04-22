const pool = require('../config/db');

const SaleModel = {
  async findProducts(filters = {}) {
    const { search = '' } = filters;
    const values = [];
    const where = ['p.estado = true'];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      where.push(`(
        p.nombre ILIKE $${values.length}
        OR p.codigo_barras ILIKE $${values.length}
        OR COALESCE(c.nombre, '') ILIKE $${values.length}
      )`);
    }

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

    const { rows } = await pool.query(query, values);
    return rows;
  },
};

module.exports = SaleModel;
