// Script para testar se o usuário SuperAdmin existe no banco
const pool = require('./config/database');

async function testUser() {
    try {
        console.log('Conectando ao banco...');
        const result = await pool.query('SELECT id, nome, usuario, cargo FROM usuarios WHERE usuario = $1', ['SuperAdmin']);
        
        console.log('Resultado da consulta:');
        console.log('Número de linhas encontradas:', result.rows.length);
        
        if (result.rows.length > 0) {
            console.log('Usuário SuperAdmin encontrado:');
            console.log(result.rows[0]);
        } else {
            console.log('Usuário SuperAdmin NÃO encontrado!');
            
            // Listar todos os usuários
            const allUsers = await pool.query('SELECT id, nome, usuario, cargo FROM usuarios LIMIT 10');
            console.log('Usuários disponíveis:');
            allUsers.rows.forEach(user => {
                console.log(`- ID: ${user.id}, Usuario: ${user.usuario}, Nome: ${user.nome}`);
            });
        }
        
    } catch (error) {
        console.error('Erro ao consultar banco:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testUser();