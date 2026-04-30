const SaleModel = require('../models/sale.model');

const knownErrors = [
  'Debes agregar productos al carrito',
  'Debes seleccionar un medio de pago',
  'No hay una caja abierta para registrar la venta',
  'Uno o varios productos ya no existen',
  'Hay productos inactivos o no disponibles en la venta',
  'La cantidad enviada no es válida',
  'No fue posible consultar el estado del pago en Wompi',
  'Wompi no devolvió información de la transacción',
  'La referencia del pago no coincide con la venta actual',
  'El monto pagado en Wompi no coincide con el total de la venta',
];

function resolveStatusCode(error) {
  if (
    knownErrors.includes(error.message) ||
    error.message.startsWith('Stock insuficiente') ||
    error.message.startsWith('La transacción Wompi quedó en estado')
  ) {
    return 400;
  }

  return 500;
}

const SaleController = {
  async getProducts(req, res) {
    try {
      const products = await SaleModel.findProducts({
        search: req.query.search || '',
      });

      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar los productos',
      });
    }
  },

  async createSale(req, res) {
    try {
      const { metodo_pago, descuento_porcentaje = 0, detalle = [] } = req.body;

      if (!metodo_pago || !String(metodo_pago).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Debes seleccionar un medio de pago',
        });
      }

      if (!Array.isArray(detalle) || !detalle.length) {
        return res.status(400).json({
          success: false,
          message: 'Debes agregar productos al carrito',
        });
      }

      const result = await SaleModel.createSale({
        userId: req.user.sub,
        paymentMethod: String(metodo_pago).trim().toUpperCase(),
        discountPercentage: descuento_porcentaje,
        items: detalle,
      });

      return res.status(201).json({
        success: true,
        message: 'Venta registrada correctamente',
        data: result,
      });
    } catch (error) {
      return res.status(resolveStatusCode(error)).json({
        success: false,
        message: error.message || 'Error al registrar la venta',
      });
    }
  },

  async createWompiCheckout(req, res) {
    try {
      const { descuento_porcentaje = 0, detalle = [] } = req.body;

      if (!Array.isArray(detalle) || !detalle.length) {
        return res.status(400).json({
          success: false,
          message: 'Debes agregar productos al carrito',
        });
      }

      const result = await SaleModel.createWompiCheckoutSession({
        user: {
          nombre: req.user.nombre,
          correo: req.user.correo,
        },
        discountPercentage: descuento_porcentaje,
        items: detalle,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(resolveStatusCode(error)).json({
        success: false,
        message: error.message || 'Error al preparar el pago con Wompi',
      });
    }
  },

  async confirmWompiSale(req, res) {
    try {
      const {
        transaction_id,
        reference,
        descuento_porcentaje = 0,
        detalle = [],
      } = req.body;

      if (!transaction_id || !reference) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos de la transacción Wompi',
        });
      }

      if (!Array.isArray(detalle) || !detalle.length) {
        return res.status(400).json({
          success: false,
          message: 'No existe un carrito pendiente para confirmar con Wompi',
        });
      }

      const wompiTransaction = await SaleModel.confirmWompiTransaction({
        transactionId: transaction_id,
        reference,
        discountPercentage: descuento_porcentaje,
        items: detalle,
      });

      const saleResult = await SaleModel.createSale({
        userId: req.user.sub,
        paymentMethod: 'WOMPI',
        discountPercentage: descuento_porcentaje,
        items: detalle,
      });

      return res.status(201).json({
        success: true,
        message: 'Pago Wompi aprobado y venta registrada correctamente',
        data: {
          wompi_transaction: wompiTransaction,
          sale_result: saleResult,
        },
      });
    } catch (error) {
      return res.status(resolveStatusCode(error)).json({
        success: false,
        message: error.message || 'Error al confirmar el pago con Wompi',
      });
    }
  },
};

module.exports = SaleController;
