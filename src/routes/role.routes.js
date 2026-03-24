const { Router } = require('express');
const RoleController = require('../controllers/role.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', authenticateToken, authorizeRoles('ADMIN'), RoleController.getAll);

module.exports = router;
