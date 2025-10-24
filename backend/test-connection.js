require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5433,
    database: process.env.DB_NAME || 'connect_gamers',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'connectgamers'
});

console.log('Tentando conectar com:');
console.log('  Host:', process.env.DB_HOST);
console.log('  Port:', process.env.DB_PORT);
console.log('  Database:', process.env.DB_NAME);
console.log('  User:', process.env.DB_USER);
console.log('  Password:', process.env.DB_PASSWORD);

client.connect()
    .then(() => {
        console.log('✅ Conectado com sucesso!');
        return client.query('SELECT usuario, is_verified FROM usuarios');
    })
    .then(res => {
        console.log('✅ Query executada com sucesso!');
        console.table(res.rows);
        return client.end();
    })
    .then(() => {
        console.log('✅ Conexão fechada.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ ERRO:', err.message);
        console.error('❌ Código:', err.code);
        console.error('❌ Stack:', err.stack);
        process.exit(1);
    });
