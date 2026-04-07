// Importamos Swagger para generar la documentación.
const swaggerJsdoc = require('swagger-jsdoc');

// Aquí definimos la información básica de la API.
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BackWeb API',
      version: '1.0.0',
      description: 'API REST con Express y PostgreSQL',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

// Generamos la documentación con la configuración anterior.
const swaggerSpec = swaggerJsdoc(options);

// Exportamos Swagger para usarlo en index.js.
module.exports = swaggerSpec;
