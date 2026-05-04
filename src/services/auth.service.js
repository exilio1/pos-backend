// Importamos bcrypt para manejar contraseñas seguras.
const bcrypt = require('bcryptjs');
// Importamos jwt para crear tokens de sesión.
const jwt = require('jsonwebtoken');
// Importamos el modelo con las consultas necesarias.
const AuthModel = require('../models/auth.model');

// Este servicio tiene la lógica principal de autenticación.
const AuthService = {
  // Registra un usuario nuevo.
  async register({ nombre, correo, contrasena, rol = 'CAJERO' }) {
    // Validamos que lleguen los datos mínimos.
    if (!nombre || !correo || !contrasena) {
      throw new Error('Nombre, correo y contrasena son obligatorios');
    }

    // Revisamos si ya existe otro usuario con ese correo.
    const existingUser = await AuthModel.findUserByEmail(correo);
    if (existingUser) {
      throw new Error('El correo ya está registrado');
    }

    // Verificamos que el rol enviado exista.
    const role = await AuthModel.findRoleByName(rol);
    if (!role) {
      throw new Error('El rol enviado no existe');
    }

    // Convertimos la contraseña a hash antes de guardarla.
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Creamos el usuario con la contraseña segura.
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

  // Valida el acceso de un usuario.
  async login({ correo, contrasena }) {
    // Revisamos que vengan ambos datos.
    if (!correo || !contrasena) {
      throw new Error('Correo y contrasena son obligatorios');
    }

    // Buscamos el usuario por correo.
    const user = await AuthModel.findUserByEmail(correo);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.estado) {
      throw new Error('El usuario está inactivo');
    }

    // Variable para saber si la contraseña es correcta.
    let passwordIsValid = false;

    // Si ya está en hash, comparamos con bcrypt.
    if (
      user.contrasena.startsWith('$2a$') ||
      user.contrasena.startsWith('$2b$') ||
      user.contrasena.startsWith('$2y$')
    ) {
      passwordIsValid = await bcrypt.compare(contrasena, user.contrasena);
    } else {
      // Si era una contraseña vieja en texto plano, la comparamos directo.
      passwordIsValid = contrasena === user.contrasena;

      if (passwordIsValid) {
        // Si coincide, la convertimos a hash para dejarla segura.
        const newHash = await bcrypt.hash(contrasena, 10);
        await AuthModel.updatePassword(user.id, newHash);
      }
    }

    if (!passwordIsValid) {
      throw new Error('Credenciales inválidas');
    }

    // Creamos el token con los datos básicos del usuario.
    const token = jwt.sign(
      {
        sub: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      }
    );

    // Devolvemos token y datos del usuario para guardar sesión.
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

// Exportamos el servicio.
module.exports = AuthService;
