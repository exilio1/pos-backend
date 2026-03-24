const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthModel = require('../models/auth.model');

const AuthService = {
  async register({ nombre, correo, contrasena, rol = 'CAJERO' }) {
    if (!nombre || !correo || !contrasena) {
      throw new Error('Nombre, correo y contrasena son obligatorios');
    }

    const existingUser = await AuthModel.findUserByEmail(correo);
    if (existingUser) {
      throw new Error('El correo ya está registrado');
    }

    const role = await AuthModel.findRoleByName(rol);
    if (!role) {
      throw new Error('El rol enviado no existe');
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const user = await AuthModel.createUser({
      nombre,
      correo,
      contrasena: hashedPassword,
      rol_id: role.id,
    });

    return {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: role.nombre,
    };
  },

  async login({ correo, contrasena }) {
    if (!correo || !contrasena) {
      throw new Error('Correo y contrasena son obligatorios');
    }

    const user = await AuthModel.findUserByEmail(correo);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.estado) {
      throw new Error('El usuario está inactivo');
    }

    let passwordIsValid = false;

    if (
      user.contrasena.startsWith('$2a$') ||
      user.contrasena.startsWith('$2b$') ||
      user.contrasena.startsWith('$2y$')
    ) {
      passwordIsValid = await bcrypt.compare(contrasena, user.contrasena);
    } else {
      passwordIsValid = contrasena === user.contrasena;

      if (passwordIsValid) {
        const newHash = await bcrypt.hash(contrasena, 10);
        await AuthModel.updatePassword(user.id, newHash);
      }
    }

    if (!passwordIsValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        correo: user.correo,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      }
    );

    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
    };
  },
};

module.exports = AuthService;
