require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const DatabaseService = require('../services/databaseService');

async function promoverSuperAdmin() {
    try {
        console.log('Buscando usuário SuperAdmin...');
        
        // Buscar o usuário SuperAdmin
        const superAdmin = await DatabaseService.getUserByUsername('SuperAdmin');
        
        if (!superAdmin) {
            console.error('❌ Usuário SuperAdmin não encontrado!');
            console.log('Certifique-se de que o usuário foi cadastrado com o nome de usuário "SuperAdmin"');
            process.exit(1);
        }
        
        console.log(`✓ Usuário encontrado: ${superAdmin.usuario} (ID: ${superAdmin.id})`);
        console.log(`  Cargo atual: ${superAdmin.cargo || 'user'}`);
        
        // Verificar se já é admin
        if (superAdmin.cargo === 'admin') {
            console.log('✓ Usuário já é administrador!');
            process.exit(0);
        }
        
        // Atualizar para admin
        console.log('Atualizando cargo para admin...');
        await DatabaseService.updateUser(superAdmin.id, { cargo: 'admin' });
        
        console.log('✓ SuperAdmin promovido a administrador com sucesso!');
        console.log('\nAgora você pode fazer login com:');
        console.log(`  Usuário: ${superAdmin.usuario}`);
        console.log(`  O Dashboard estará disponível no menu após o login.`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erro ao promover SuperAdmin:', error.message);
        console.error(error);
        process.exit(1);
    }
}

promoverSuperAdmin();

