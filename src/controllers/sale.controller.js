// Importamos el modelo que consulta productos del módulo de ventas.
const SaleModel = require('../models/sale.model');

// Este controlador responde las peticiones de la pantalla de ventas.
const SaleController = {
  // Devuelve productos activos y aplica el filtro de búsqueda si existe.
  async getProducts(req, res) {
    try {
      const products = await SaleModel.findProducts({
        search: req.query.search || '',
      });

      // Si la consulta sale bien, enviamos la lista al frontend.
      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      // Si ocurre un problema, devolvemos un error general del servidor.
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar los productos',
      });
    }
  },
};

// Exportamos el controlador para usarlo en las rutas.
module.exports = SaleController;
