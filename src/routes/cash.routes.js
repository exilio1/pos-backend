// Importamos Router para crear las rutas.
const { Router } = require('express');
// Importamos el controlador de cajas.
const CashController = require('../controllers/cash.controller');
// Importamos el middleware para exigir sesión.
const { authenticateToken } = require('../middlewares/auth.middleware');

// Creamos el grupo de rutas del módulo cash.
const router = Router();

// Ruta para consultar la caja abierta actual.
router.get('/current', authenticateToken, CashController.getCurrent);
// Ruta para abrir una caja nueva.
router.post('/open', authenticateToken, CashController.open);
// Ruta para cerrar la caja abierta.
router.post('/close', authenticateToken, CashController.close);

// Exportamos las rutas.
module.exports = router;
