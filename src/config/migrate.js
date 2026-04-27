// Reutilizamos la conexión a PostgreSQL.
const pool = require('./db');

// Aquí dejamos una estructura básica para crear tablas o columnas al iniciar.
const schema = [
  {
    table: 'users',
    create: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    columns: [
      { name: 'name',       def: 'VARCHAR(100) NOT NULL' },
      { name: 'email',      def: 'VARCHAR(150)' },
      { name: 'password',   def: 'VARCHAR(255) NOT NULL' },
      { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    ],
  },
];

// Recorre la definición del esquema y crea lo que haga falta.
async function runMigrations() {
  for (const entry of schema) {
    // Primero crea la tabla si todavía no existe.
    await pool.query(entry.create);

    // Después consulta qué columnas ya están creadas.
    const { rows } = await pool.query(
      'SELECT column_name FROM information_schema.columns WHERE table_name = $1',
      [entry.table]
    );
    const existing = rows.map((r) => r.column_name);

    for (const col of entry.columns) {
      // Si falta una columna, la agrega sin borrar lo anterior.
      if (!existing.includes(col.name)) {
        await pool.query(`ALTER TABLE ${entry.table} ADD COLUMN IF NOT EXISTS ${col.name} ${col.def}`);
        console.log(`Columna añadida: ${entry.table}.${col.name}`);
      }
    }

    // Mensaje simple para confirmar que esa tabla quedó revisada.
    console.log(`Tabla lista: ${entry.table}`);
  }
}

// Exportamos la función para ejecutarla desde otros archivos si se necesita.
module.exports = runMigrations;
