const pool = require('../config/db');

const ProductModel = {
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
};

module.exports = ProductModel;
