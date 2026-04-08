// Importamos Pool para conectarnos a PostgreSQL.
const { Pool } = require('pg');
// Leemos las variables del archivo .env.
require('dotenv').config();

// Aquí configuramos la conexión usando los datos del entorno.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Si ocurre un error en la conexión, lo mostramos en consola.
pool.on('error', (err) => {
  console.error('Error en el pool de PostgreSQL:', err);
});

// Exportamos la conexión para usarla en los modelos.
module.exports = pool;
