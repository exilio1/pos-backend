// Importamos el modelo de usuarios.
const UserModel = require('../models/user.model');
// Reutilizamos el servicio auth para registrar usuarios con hash.
const AuthService = require('../services/auth.service')

// Este controlador maneja el módulo de usuarios.
const UserController = {
  // Lista todos los usuarios.
  async getAll(req, res) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Busca un usuario por su id.
  async getById(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

// Este método crea usuarios desde la parte administrativa.
async create(req, res) {
  try {
    // Usamos la misma lógica de registro para guardar bien la contraseña.
    const result = await AuthService.register(req.body);

    return res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente por el administrador',
      data: result,
    });
  } catch (error) {
    let statusCode = 400;

    if (error.message === 'El correo ya está registrado') {
      statusCode = 409;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
},


  // Actualiza nombre y correo del usuario.
  async update(req, res) {
    try {
      const { nombre, correo } = req.body;

      if (!nombre || !correo) {
        return res.status(400).json({
          success: false,
          message: 'nombre y correo son requeridos',
        });
      }

      const user = await UserModel.update(req.params.id, { nombre, correo });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Elimina un usuario por id.
  async remove(req, res) {
    try {
      const user = await UserModel.delete(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

// Exportamos el controlador.
module.exports = UserController;
