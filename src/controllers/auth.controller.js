const AuthService = require('../services/auth.service');

const AuthController = {
  async register(req, res) {
    try {
      const result = await AuthService.register(req.body);

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        data: result,
      });
    } catch (error) {
      console.error('ERROR EN REGISTER:', error);

      let statusCode = 400;

      if (error.message === 'El correo ya está registrado') {
        statusCode = 409;
      }

      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error interno en registro',
      });
    }
  },

  async login(req, res) {
    try {
      const result = await AuthService.login(req.body);

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result,
      });
    } catch (error) {
      console.error('ERROR EN LOGIN:', error);

      return res.status(401).json({
        success: false,
        message: error.message || 'Error interno en login',
      });
    }
  },
};

module.exports = AuthController;
