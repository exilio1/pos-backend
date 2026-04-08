// Importamos el servicio que contiene la lógica de auth.
const AuthService = require('../services/auth.service');

// Este controlador responde las peticiones relacionadas con autenticación.
const AuthController = {
  // Este método registra un usuario nuevo.
  async register(req, res) {
    try {
      // Enviamos los datos al servicio.
      const result = await AuthService.register(req.body);

      // Si todo sale bien, devolvemos respuesta de éxito.
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        data: result,
      });
    } catch (error) {
      // Si falla, lo mostramos en consola para revisarlo.
      console.error('ERROR EN REGISTER:', error);

      // Por defecto usamos un error 400.
      let statusCode = 400;

      // Si el correo ya existe, devolvemos conflicto.
      if (error.message === 'El correo ya está registrado') {
        statusCode = 409;
      }

      // Respondemos con el error correspondiente.
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error interno en registro',
      });
    }
  },

  // Este método valida el login del usuario.
  async login(req, res) {
    try {
      // Enviamos los datos del formulario al servicio.
      const result = await AuthService.login(req.body);

      // Si es correcto, devolvemos token y datos del usuario.
      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result,
      });
    } catch (error) {
      // Mostramos el error por si algo falla.
      console.error('ERROR EN LOGIN:', error);

      // Respondemos con error de autenticación.
      return res.status(401).json({
        success: false,
        message: error.message || 'Error interno en login',
      });
    }
  },
};

// Exportamos el controlador para usarlo en las rutas.
module.exports = AuthController;
