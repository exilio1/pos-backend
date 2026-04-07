// Importamos Router.
const { Router } = require('express');
// Importamos el controlador de roles.
const RoleController = require('../controllers/role.controller');
// Importamos middlewares para proteger esta ruta.
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

// Creamos el grupo de rutas.
const router = Router();

// Solo un admin puede listar los roles.
router.get('/', authenticateToken, authorizeRoles('ADMIN'), RoleController.getAll);

// Exportamos las rutas.
module.exports = router;
