// Importamos el modelo de productos.
const ProductModel = require('../models/product.model');

// Este controlador maneja las respuestas del módulo de productos.
const ProductController = {
  // Este método devuelve el listado de productos.
  async getAll(req, res) {
    try {
      // Consultamos todos los productos en la base de datos.
      const products = await ProductModel.findAll();

      // Si todo sale bien, enviamos la lista al frontend.
      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      // Si falla la consulta, enviamos error del servidor.
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar productos',
      });
    }
  },
};

// Exportamos el controlador.
module.exports = ProductController;
