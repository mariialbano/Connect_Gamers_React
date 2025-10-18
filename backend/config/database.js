const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'connect_gamers',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'connectgamers',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Teste de conexão
pool.on('connect', () => {
    console.log('Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Erro inesperado no cliente PostgreSQL:', err);
    process.exit(-1);
});

module.exports = pool;
