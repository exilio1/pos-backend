const { Router } = require('express');
const UserController = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', authenticateToken, authorizeRoles('ADMIN'), UserController.getAll);
router.get('/:id', authenticateToken, UserController.getById);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), UserController.create);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), UserController.update);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), UserController.remove);

module.exports = router;
