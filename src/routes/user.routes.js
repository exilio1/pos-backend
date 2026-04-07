// Importamos Router.
const { Router } = require('express');
// Importamos el controlador de usuarios.
const UserController = require('../controllers/user.controller');
// Importamos middlewares de auth y roles.
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

// Creamos el grupo de rutas de usuarios.
const router = Router();

// Listar usuarios: solo admin.
router.get('/', authenticateToken, authorizeRoles('ADMIN'), UserController.getAll);
// Ver un usuario por id: cualquier usuario logueado.
router.get('/:id', authenticateToken, UserController.getById);
// Crear usuario: solo admin.
router.post('/', authenticateToken, authorizeRoles('ADMIN'), UserController.create);
// Actualizar usuario: solo admin.
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), UserController.update);
// Eliminar usuario: solo admin.
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), UserController.remove);

// Exportamos las rutas.
module.exports = router;
