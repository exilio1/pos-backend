const SaleModel = require('../models/sale.model');

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
};

module.exports = SaleController;
