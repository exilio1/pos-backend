const UserModel = require('../models/user.model');
const AuthService = require('../services/auth.service')

const UserController = {
  async getAll(req, res) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

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

async create(req, res) {
  try {
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

module.exports = UserController;
