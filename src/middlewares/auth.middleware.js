// Importamos JWT para validar el token.
const jwt = require('jsonwebtoken');

// Este middleware revisa si el usuario envió un token válido.
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Si no viene token, bloqueamos el acceso.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token requerido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificamos el token y guardamos los datos del usuario en la request.
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    // Si el token es inválido o vencido, devolvemos error.
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
}

// Este middleware revisa si el usuario tiene uno de los roles permitidos.
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
      });
    }

    next();
  };
}

// Exportamos ambos middlewares.
module.exports = {
  authenticateToken,
  authorizeRoles,
};
