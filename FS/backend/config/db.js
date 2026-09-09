require('dotenv').config(); 
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
});

pool.connect((err) => {
  if (err) {
    console.error(' Gagal nyambung ke PostgreSQL:', err.stack);
  } else {
    console.log('Berhasil nyambung ke Database PostgreSQL CerminSaku!');
  }
});

module.exports = pool;