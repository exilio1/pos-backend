// Importamos Router para crear las rutas.
const { Router } = require('express');
// Importamos el controlador de auth.
const AuthController = require('../controllers/auth.controller');

// Creamos el grupo de rutas de autenticación.
const router = Router();

// Ruta para iniciar sesión.
router.post('/login', AuthController.login);

// Exportamos las rutas.
module.exports = router;
