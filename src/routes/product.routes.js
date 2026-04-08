// Importamos Router para crear las rutas.
const { Router } = require('express');
// Importamos el controlador de productos.
const ProductController = require('../controllers/product.controller');
// Importamos el middleware para exigir sesión y roles.
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

// Creamos el grupo de rutas del módulo products.
const router = Router();

// Ruta para listar productos, solo si el usuario está autenticado.
router.get('/', authenticateToken, ProductController.getAll);
// Ruta para obtener las categorías disponibles.
router.get('/categories', authenticateToken, ProductController.getCategories);
// Ruta para crear un producto, solo admin.
router.post('/', authenticateToken, authorizeRoles('ADMIN'), ProductController.create);

// Exportamos las rutas.
module.exports = router;
