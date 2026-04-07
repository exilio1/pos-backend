const { Router } = require('express');
const ProductController = require('../controllers/product.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', authenticateToken, ProductController.getAll);

module.exports = router;
