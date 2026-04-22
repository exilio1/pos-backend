const { Router } = require('express');
const SaleController = require('../controllers/sale.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/products', authenticateToken, SaleController.getProducts);

module.exports = router;
