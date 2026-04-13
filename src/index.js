// Leemos las variables del .env.
require('dotenv').config();
// Importamos Express para crear el servidor.
const express = require('express');
// Importamos CORS para permitir conexión con el frontend.
const cors = require('cors');
// Importamos Swagger para ver la API documentada.
const swaggerUi = require('swagger-ui-express');
// Traemos la configuración de Swagger.
const swaggerSpec = require('./config/swagger');
// Rutas del módulo auth.
const authRoutes = require('./routes/auth.routes');
// Rutas del módulo users.
const userRoutes = require('./routes/user.routes');
// Rutas del módulo roles.
const roleRoutes = require('./routes/role.routes');
// Rutas del módulo products.
const productRoutes = require('./routes/product.routes');


// Creamos la app principal del backend.
const app = express();
// Tomamos el puerto desde el entorno o usamos 3000.
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Permitimos peticiones del frontend.
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
}));

// Permitimos recibir datos en formato JSON.
app.use(express.json());

// Ruta para ver la documentación.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Ruta de autenticación.
app.use('/api/auth', authRoutes);
// Ruta de usuarios.
app.use('/api/users', userRoutes);
// Ruta de roles.
app.use('/api/roles', roleRoutes);
// Ruta de productos.
app.use('/api/products', productRoutes);


// Ruta simple para comprobar que la API está funcionando.
app.get('/', (req, res) => {
  res.json({ message: 'API corriendo', docs: '/api-docs' });
});

// Encendemos el servidor.
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Swagger en http://localhost:${PORT}/api-docs`);
});
