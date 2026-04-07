// Importamos el modelo que ya sabe consultar roles.
const AuthModel = require('../models/auth.model');

// Este controlador devuelve los roles del sistema.
const RoleController = {
  // Lista todos los roles para usarlos en el frontend.
  async getAll(req, res) {
    try {
      const roles = await AuthModel.findAllRoles();
      return res.json({ success: true, data: roles });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

// Exportamos el controlador.
module.exports = RoleController;
