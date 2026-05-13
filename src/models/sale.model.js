const crypto = require('crypto');
const pool = require('../config/db');

// Deja el descuento dentro de un rango válido entre 0 y 100.
function normalizeDiscount(discountPercentage = 0) {
  return Math.min(Math.max(Number(discountPercentage) || 0, 0), 100);
}

// Busca la última caja abierta porque una venta no se debe guardar sin caja activa.
async function findOpenCashRegister(client) {
  const openCashRegisterQuery = `
    SELECT id
    FROM cajas
    WHERE estado = 'ABIERTA'
    ORDER BY fecha_apertura DESC
    LIMIT 1
  `;
  const openCashRegisterResult = await client.query(openCashRegisterQuery);
  const openCashRegister = openCashRegisterResult.rows[0];

  if (!openCashRegister) {
    throw new Error('No hay una caja abierta para registrar la venta');
  }

  return openCashRegister;
}

// Valida productos, arma el detalle y recalcula totales desde backend.
async function buildSaleData(client, items = [], discountPercentage = 0) {
  const productIds = items.map((item) => item.producto_id);

  if (!productIds.length) {
    throw new Error('Debes agregar productos al carrito');
  }

  const productsQuery = `
    SELECT id, nombre, precio, stock, estado
    FROM productos
    WHERE id = ANY($1::uuid[])
  `;
  const productsResult = await client.query(productsQuery, [productIds]);
  const products = productsResult.rows;

  if (products.length !== productIds.length) {
    throw new Error('Uno o varios productos ya no existen');
  }

  const productsMap = new Map(products.map((product) => [product.id, product]));
  const detailRows = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productsMap.get(item.producto_id);
    const quantity = Number(item.cantidad);

    if (!product || !product.estado) {
      throw new Error('Hay productos inactivos o no disponibles en la venta');
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('La cantidad enviada no es válida');
    }

    if (quantity > Number(product.stock)) {
      throw new Error(`Stock insuficiente para ${product.nombre}`);
    }

    const unitPrice = Number(product.precio);
    const lineSubtotal = unitPrice * quantity;
    subtotal += lineSubtotal;

    detailRows.push({
      producto_id: product.id,
      nombre: product.nombre,
      cantidad: quantity,
      precio_unitario: unitPrice,
      subtotal: lineSubtotal,
    });
  }

  const normalizedDiscount = normalizeDiscount(discountPercentage);
  const discountValue = subtotal * (normalizedDiscount / 100);
  const total = subtotal - discountValue;

  return {
    detailRows,
    summary: {
      subtotal,
      discount_percentage: normalizedDiscount,
      discount_value: discountValue,
      total,
      total_items: detailRows.reduce((accumulator, item) => accumulator + item.cantidad, 0),
      distinct_products: detailRows.length,
    },
  };
}

const SaleModel = {
  // Consulta productos activos y permite filtrar por nombre, código o categoría.
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

  // Guarda la venta principal, el detalle y descuenta el stock en una sola transacción.
  async createSale({ userId, paymentMethod, discountPercentage = 0, items = [] }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const openCashRegister = await findOpenCashRegister(client);
      const { detailRows, summary } = await buildSaleData(client, items, discountPercentage);

      const saleInsertQuery = `
        INSERT INTO ventas (usuario_id, caja_id, total, metodo_pago, estado)
        VALUES ($1, $2, $3, $4, 'COMPLETADA')
        RETURNING id, usuario_id, caja_id, total, metodo_pago, estado, creado_en
      `;
      const saleInsertValues = [
        userId,
        openCashRegister.id,
        summary.total,
        paymentMethod,
      ];
      const saleResult = await client.query(saleInsertQuery, saleInsertValues);
      const sale = saleResult.rows[0];

      for (const detail of detailRows) {
        await client.query(
          `
            INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [sale.id, detail.producto_id, detail.cantidad, detail.precio_unitario, detail.subtotal],
        );

        await client.query(
          `
            UPDATE productos
            SET stock = stock - $1, actualizado_en = CURRENT_TIMESTAMP
            WHERE id = $2
          `,
          [detail.cantidad, detail.producto_id],
        );
      }

      await client.query('COMMIT');

      return {
        sale,
        summary,
        detail: detailRows,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Prepara los datos que Wompi necesita para abrir el widget de pago.
  async createWompiCheckoutSession({ user, discountPercentage = 0, items = [] }) {
    const client = await pool.connect();

    try {
      const { summary } = await buildSaleData(client, items, discountPercentage);

      const amountInCents = Math.round(summary.total * 100);
      const reference = `POS-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const integritySeed = `${reference}${amountInCents}COP${process.env.WOMPI_INTEGRITY_SECRET}`;
      const integritySignature = crypto
        .createHash('sha256')
        .update(integritySeed)
        .digest('hex');

      return {
        reference,
        amount_in_cents: amountInCents,
        public_key: process.env.WOMPI_PUBLIC_KEY,
        currency: 'COP',
        signature_integrity: integritySignature,
        customer_data: {
          email: user?.correo || '',
          full_name: user?.nombre || '',
        },
        summary,
      };
    } finally {
      client.release();
    }
  },

  // Confirma que la transacción en Wompi sí exista, esté aprobada y coincida con la venta.
  async confirmWompiTransaction({ transactionId, reference, discountPercentage = 0, items = [] }) {
    const wompiBaseUrl = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';

    const response = await fetch(`${wompiBaseUrl}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.WOMPI_PUBLIC_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('No fue posible consultar el estado del pago en Wompi');
    }

    const wompiPayload = await response.json();
    const transaction = wompiPayload.data;

    if (!transaction) {
      throw new Error('Wompi no devolvió información de la transacción');
    }

    if (transaction.reference !== reference) {
      throw new Error('La referencia del pago no coincide con la venta actual');
    }

    if (transaction.status !== 'APPROVED') {
      throw new Error(`La transacción Wompi quedó en estado ${transaction.status}`);
    }

    const client = await pool.connect();

    try {
      const { summary } = await buildSaleData(client, items, discountPercentage);
      const expectedAmountInCents = Math.round(summary.total * 100);

      if (Number(transaction.amount_in_cents) !== expectedAmountInCents) {
        throw new Error('El monto pagado en Wompi no coincide con el total de la venta');
      }
    } finally {
      client.release();
    }

    return {
      transaction_id: transaction.id,
      reference: transaction.reference,
      status: transaction.status,
      amount_in_cents: transaction.amount_in_cents,
      payment_method_type: transaction.payment_method_type,
    };
  },
};

module.exports = SaleModel;
