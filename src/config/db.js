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

// Función para verificar la conexión al iniciar.
async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT current_database(), current_user');
    console.log(`✅ PostgreSQL conectado - DB: ${res.rows[0].current_database}, Usuario: ${res.rows[0].current_user}`);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    return false;
  }
}

// Exportamos la conexión y el test.
module.exports = pool;
module.exports.testConnection = testConnection;
