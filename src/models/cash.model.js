// Importamos la conexión a la base de datos.
const pool = require('../config/db');

// Este modelo maneja las cajas (apertura y cierre).
const CashModel = {
  // Devuelve la caja abierta más reciente (o null si no hay).
  async findOpenCashRegister() {
    const query = `
      SELECT
        c.id,
        c.monto_apertura,
        c.monto_cierre,
        c.abierto_por,
        c.cerrado_por,
        c.fecha_apertura,
        c.fecha_cierre,
        c.estado,
        u.nombre AS abierto_por_nombre
      FROM cajas c
      LEFT JOIN usuarios u ON u.id = c.abierto_por
      WHERE c.estado = 'ABIERTA'
      ORDER BY c.fecha_apertura DESC
      LIMIT 1
    `;

    const { rows } = await pool.query(query);
    return rows[0] || null;
  },

  // Abre una caja con el monto inicial indicado.
  async openCashRegister({ userId, openingAmount }) {
    const query = `
      INSERT INTO cajas (monto_apertura, abierto_por, estado)
      VALUES ($1, $2, 'ABIERTA')
      RETURNING id, monto_apertura, abierto_por, fecha_apertura, estado
    `;

    const { rows } = await pool.query(query, [openingAmount, userId]);
    return rows[0];
  },

  // Calcula el total de ventas en efectivo registradas en una caja.
  async getCashSalesTotal(cashRegisterId) {
    const query = `
      SELECT COALESCE(SUM(total), 0) AS total_ventas
      FROM ventas
      WHERE caja_id = $1
        AND estado = 'COMPLETADA'
        AND metodo_pago = 'EFECTIVO'
    `;

    const { rows } = await pool.query(query, [cashRegisterId]);
    return Number(rows[0].total_ventas);
  },

  // Cierra una caja con el monto físico contado.
  async closeCashRegister({ cashRegisterId, userId, closingAmount }) {
    const query = `
      UPDATE cajas
      SET monto_cierre = $1,
          cerrado_por = $2,
          fecha_cierre = CURRENT_TIMESTAMP,
          estado = 'CERRADA'
      WHERE id = $3 AND estado = 'ABIERTA'
      RETURNING id, monto_apertura, monto_cierre, abierto_por, cerrado_por,
                fecha_apertura, fecha_cierre, estado
    `;

    const { rows } = await pool.query(query, [closingAmount, userId, cashRegisterId]);
    return rows[0] || null;
  },
};

// Exportamos el modelo.
module.exports = CashModel;
