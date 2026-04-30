const { Router } = require('express');
const SaleController = require('../controllers/sale.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/products', authenticateToken, SaleController.getProducts);
router.post('/', authenticateToken, SaleController.createSale);
router.post('/wompi/checkout', authenticateToken, SaleController.createWompiCheckout);
router.post('/wompi/confirm', authenticateToken, SaleController.confirmWompiSale);

module.exports = router;
