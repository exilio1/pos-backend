// Importamos Router para agrupar las rutas del módulo.
const { Router } = require('express');
// Importamos el controlador con la lógica de ventas.
const SaleController = require('../controllers/sale.controller');
// Este middleware obliga a que el usuario tenga sesión válida.
const { authenticateToken } = require('../middlewares/auth.middleware');

// Creamos el grupo de rutas de ventas.
const router = Router();

// Devuelve los productos disponibles para vender.
router.get('/products', authenticateToken, SaleController.getProducts);

// Exportamos el router para conectarlo en index.js.
module.exports = router;
