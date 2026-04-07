const ProductModel = require('../models/product.model');

const ProductController = {
  async getAll(req, res) {
    try {
      const products = await ProductModel.findAll();

      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar productos',
      });
    }
  },
};

module.exports = ProductController;
