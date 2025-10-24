const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function checkAndCreateSuperAdmin() {
  try {
    console.log('🔍 Verificando usuário SuperAdmin...\n');
    
    // Verificar se SuperAdmin existe
    const result = await pool.query(
      "SELECT id, nome, usuario, cargo FROM usuarios WHERE LOWER(usuario) = 'superadmin'"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ SuperAdmin encontrado no banco:');
      console.log('   ID:', result.rows[0].id);
      console.log('   Nome:', result.rows[0].nome);
      console.log('   Usuário:', result.rows[0].usuario);
      console.log('   Cargo:', result.rows[0].cargo);
      console.log('\n📌 Credenciais de acesso:');
      console.log('   Usuário: SuperAdmin');
      console.log('   Senha: SuperAdmin123!');
    } else {
      console.log('❌ SuperAdmin não encontrado. Criando...\n');
      
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
      
      await pool.query(
        `INSERT INTO usuarios (nome, usuario, senha, cargo, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        ['SuperAdmin', 'SuperAdmin', hashedPassword, 'admin']
      );
      
      console.log('✅ SuperAdmin criado com sucesso!');
      console.log('\n📌 Credenciais de acesso:');
      console.log('   Usuário: SuperAdmin');
      console.log('   Senha: SuperAdmin123!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkAndCreateSuperAdmin();
