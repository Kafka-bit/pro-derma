import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  user: process.env.DB_USER || 'kafka',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'propiel_db',
  password: process.env.DB_PASSWORD || 'Salvatierra21#',
  port: process.env.DB_PORT || 5432,
 })

 //Funcion para ejecutar consultas
 async function query(text, params){
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query:', { text, duration, rows: res.rowCount});
    return res;
  } catch (error) {
    console.error('Error executing query:', {text, error});
    throw error;
  }
 }

 //Para verificar la conexión al inicio
 pool.on('error', (err) => {
  console.error('Error inesperado en el pool de base de datos:', err);
  process.exit(-1);
 });

 export default { query, pool};