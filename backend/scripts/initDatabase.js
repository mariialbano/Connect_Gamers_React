const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../config/database');

async function createTables() {
    const client = await pool.connect();
    
    try {
        console.log('Criando tabelas...');
        
        // Tabela de usuários
        await client.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id VARCHAR(50) PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                usuario VARCHAR(100) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                cargo VARCHAR(50) DEFAULT 'user',
                avatar VARCHAR(500),
                is_verified BOOLEAN DEFAULT FALSE,
                face_data JSONB,
                face_image BYTEA,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Garantir colunas para armazenar dados faciais (caso banco já exista)
        await client.query(`
            ALTER TABLE usuarios
            ADD COLUMN IF NOT EXISTS face_image BYTEA
        `);
        
        // Adicionar colunas para Face++ API
        await client.query(`
            ALTER TABLE usuarios
            ADD COLUMN IF NOT EXISTS face_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS status_verificacao BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS data_verificacao TIMESTAMP
        `);

        // Tabela de jogos
        await client.query(`
            CREATE TABLE IF NOT EXISTS jogos (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image VARCHAR(500),
                video VARCHAR(500),
                categories TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de eventos dos jogos
        await client.query(`
            CREATE TABLE IF NOT EXISTS eventos (
                id SERIAL PRIMARY KEY,
                jogo_id VARCHAR(50) REFERENCES jogos(id) ON DELETE CASCADE,
                nome VARCHAR(255) NOT NULL,
                dia VARCHAR(50),
                horario VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de squads
        await client.query(`
            CREATE TABLE IF NOT EXISTS squads (
                id VARCHAR(50) PRIMARY KEY,
                nome_squad VARCHAR(255) NOT NULL,
                jogo VARCHAR(255) NOT NULL,
                evento_id INTEGER REFERENCES eventos(id),
                nivel VARCHAR(50),
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de integrantes dos squads (relação many-to-many)
        await client.query(`
            CREATE TABLE IF NOT EXISTS squad_integrantes (
                id SERIAL PRIMARY KEY,
                squad_id VARCHAR(50) REFERENCES squads(id) ON DELETE CASCADE,
                usuario_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(squad_id, usuario_id)
            )
        `);

        // Tabela de canais de chat
        await client.query(`
            CREATE TABLE IF NOT EXISTS chat_channels (
                id SERIAL PRIMARY KEY,
                channel_name VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de mensagens dos canais
        await client.query(`
            CREATE TABLE IF NOT EXISTS channel_messages (
                id SERIAL PRIMARY KEY,
                message_id VARCHAR(50) UNIQUE NOT NULL,
                channel_id INTEGER REFERENCES chat_channels(id) ON DELETE CASCADE,
                user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
                username VARCHAR(255) NOT NULL,
                text TEXT NOT NULL,
                role VARCHAR(50),
                avatar VARCHAR(500),
                reactions JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de chats privados
        await client.query(`
            CREATE TABLE IF NOT EXISTS private_chats (
                id SERIAL PRIMARY KEY,
                user_a VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                user_b VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_a, user_b)
            )
        `);

        // Tabela de mensagens privadas
        await client.query(`
            CREATE TABLE IF NOT EXISTS private_messages (
                id SERIAL PRIMARY KEY,
                message_id VARCHAR(50) UNIQUE NOT NULL,
                chat_id INTEGER REFERENCES private_chats(id) ON DELETE CASCADE,
                user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
                username VARCHAR(255) NOT NULL,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de chats de grupo (squads)
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_chats (
                id VARCHAR(50) PRIMARY KEY,
                squad_id VARCHAR(50) REFERENCES squads(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de membros dos grupos
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_members (
                id SERIAL PRIMARY KEY,
                group_id VARCHAR(50) REFERENCES group_chats(id) ON DELETE CASCADE,
                user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(group_id, user_id)
            )
        `);

        // Tabela de mensagens dos grupos
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_messages (
                id SERIAL PRIMARY KEY,
                message_id VARCHAR(50) UNIQUE NOT NULL,
                group_id VARCHAR(50) REFERENCES group_chats(id) ON DELETE CASCADE,
                user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
                username VARCHAR(255) NOT NULL,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de status dos usuários
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_statuses (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'Disponível',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);

        // Tabela de solicitações de amizade
        await client.query(`
            CREATE TABLE IF NOT EXISTS friend_requests (
                id VARCHAR(50) PRIMARY KEY,
                sender_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                receiver_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'pendente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de amizades
        await client.query(`
            CREATE TABLE IF NOT EXISTS friendships (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                friend_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, friend_id)
            )
        `);

        // Tabela de tokens de verificação facial
        await client.query(`
            CREATE TABLE IF NOT EXISTS verification_tokens (
                id SERIAL PRIMARY KEY,
                token VARCHAR(255) UNIQUE NOT NULL,
                user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de moderação
        await client.query(`
            CREATE TABLE IF NOT EXISTS moderation_users (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
                infractions JSONB DEFAULT '[]',
                block_until BIGINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);

        // Tabela de feedback
        await client.query(`
            CREATE TABLE IF NOT EXISTS feedback_summary (
                id SERIAL PRIMARY KEY,
                total INTEGER DEFAULT 0,
                categories JSONB DEFAULT '{}',
                last_update TIMESTAMP,
                last_feedbacks JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Criar índices para melhor performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id ON channel_messages(channel_id);
            CREATE INDEX IF NOT EXISTS idx_channel_messages_created_at ON channel_messages(created_at);
            CREATE INDEX IF NOT EXISTS idx_private_messages_chat_id ON private_messages(chat_id);
            CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
            CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
            CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
            CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
            CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
        `);

        console.log('Tabelas criadas com sucesso!');
        
    } catch (error) {
        console.error('Erro ao criar tabelas:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function createDefaultData() {
    const client = await pool.connect();
    
    try {
        console.log('Criando dados padrão...');
        
        // Criar usuário SuperAdmin
        const bcrypt = require('bcrypt');
        const superAdminPassword = 'SuperAdmin123!';
        const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
        
        await client.query(`
            INSERT INTO usuarios (id, nome, usuario, senha, cargo, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (usuario) DO NOTHING
        `, ['superadmin', 'Super Administrador', 'SuperAdmin', hashedPassword, 'admin']);
        
        console.log('Usuário SuperAdmin criado com sucesso!');
        console.log('Usuário: SuperAdmin');
        console.log('Senha: SuperAdmin123!');
        
        // Criar jogos padrão
        const jogos = [
            {
                id: 'cs2',
                name: 'Counter Strike 2',
                desc: 'FPS tático competitivo em que duas equipes (Terroristas e Contra-Terroristas) disputam objetivos de bomba ou resgate de reféns. Destaque para economia de rounds, precisão, granadas utilitárias e coordenação estratégica em campeonatos, scrims e ligas ranqueadas.',
                image: '/assets/cs2.png',
                video: 'https://www.youtube.com/watch?v=c80dVYcL69E',
                categories: ['FPS', 'Tático']
            },
            {
                id: 'fortnite',
                name: 'Fortnite',
                desc: 'Battle Royale com construção, modos criativos e eventos sazonais ao vivo. Jogadores caem em uma ilha dinânica, coletam recursos, constroem estruturas defensivas e disputam até restar apenas um esquadrão ou jogador. Inclui arenas competitivas e mapas personalizados da comunidade.',
                image: '/assets/fortnite.png',
                video: 'https://www.youtube.com/watch?v=CjxeUy-76Vc',
                categories: ['Battle Royale', 'Criativo']
            },
            {
                id: 'lol',
                name: 'League of Legends',
                desc: 'MOBA 5x5 focado em controle de mapa, rotações, objetivos estratégicos (torres, dragões, arauto e barão) e composição de campeões. Amplamente jogado em filas ranqueadas, ligas regionais, treinos (scrims) e campeonatos internacionais.',
                image: '/assets/lol.png',
                video: 'https://www.youtube.com/watch?v=pNjWjwae-us',
                categories: ['MOBA', 'Competitivo']
            },
            {
                id: 'rocketleague',
                name: 'Rocket League',
                desc: 'Futebol veicular arcade em alta velocidade onde equipes usam impulsos aéreos e manobras acrobáticas para marcar gols. Combina física precisa, timing e posicionamento em modos casuais, competitivos e eventos especiais.',
                image: '/assets/rocketleague.png',
                video: 'https://www.youtube.com/watch?v=SgSX3gOrj60',
                categories: ['Esporte', 'Competitivo']
            },
            {
                id: 'valorant',
                name: 'Valorant',
                desc: 'FPS tático 5x5 que mistura precisão de tiro com habilidades únicas de agentes (controle de área, visão e suporte). Partidas divididas em ataque/defesa com economia de créditos, execução de estratégias e comunicação essencial em ranqueadas, scrims e campeonatos.',
                image: '/assets/valorant.png',
                video: 'https://www.youtube.com/watch?v=IhhjcB2ZjIM',
                categories: ['FPS', 'Competitivo']
            }
        ];

        for (const jogo of jogos) {
            await client.query(`
                INSERT INTO jogos (id, name, description, image, video, categories, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    image = EXCLUDED.image,
                    video = EXCLUDED.video,
                    categories = EXCLUDED.categories,
                    updated_at = CURRENT_TIMESTAMP
            `, [jogo.id, jogo.name, jogo.desc, jogo.image, jogo.video, jogo.categories]);
        }

        // Criar eventos para cada jogo
        const eventos = [
            // Valorant
            { jogo_id: 'valorant', nome: 'Spike Rush', dia: 'Sábado', horario: '13:00 às 15:00' },
            { jogo_id: 'valorant', nome: 'Competitivo', dia: 'Domingo', horario: '16:00 às 18:00' },
            { jogo_id: 'valorant', nome: 'Deathmatch', dia: 'Sexta', horario: '20:00 às 22:00' },
            
            // Rocket League
            { jogo_id: 'rocketleague', nome: 'Duplas', dia: 'Quarta', horario: '10:00 às 12:00' },
            { jogo_id: 'rocketleague', nome: 'Trio', dia: 'Sábado', horario: '15:00 às 17:00' },
            { jogo_id: 'rocketleague', nome: '1x1', dia: 'Domingo', horario: '09:00 às 11:00' },
            
            // League of Legends
            { jogo_id: 'lol', nome: '5v5 Tradicional', dia: 'Sábado', horario: '14:00 às 16:00' },
            { jogo_id: 'lol', nome: 'ARAM', dia: 'Domingo', horario: '17:00 às 19:00' },
            { jogo_id: 'lol', nome: 'TFT', dia: 'Segunda', horario: '20:00 às 22:00' },
            
            // Fortnite
            { jogo_id: 'fortnite', nome: 'Solo', dia: 'Sábado', horario: '12:00 às 14:00' },
            { jogo_id: 'fortnite', nome: 'Duplas', dia: 'Sábado', horario: '15:00 às 17:00' },
            { jogo_id: 'fortnite', nome: 'Squad', dia: 'Domingo', horario: '18:00 às 20:00' },
            
            // Counter Strike 2
            { jogo_id: 'cs2', nome: '5v5 Competitivo', dia: 'Sábado', horario: '13:00 às 15:00' },
            { jogo_id: 'cs2', nome: '2v2 Wingman', dia: 'Domingo', horario: '16:00 às 18:00' },
            { jogo_id: 'cs2', nome: 'Modo Casual', dia: 'Sexta', horario: '19:00 às 21:00' }
        ];

        for (const evento of eventos) {
            await client.query(`
                INSERT INTO eventos (jogo_id, nome, dia, horario, created_at)
                VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                ON CONFLICT DO NOTHING
            `, [evento.jogo_id, evento.nome, evento.dia, evento.horario]);
        }

        // Criar canais de chat padrão
        const canais = ['Geral', 'Valorant', 'League of Legends', 'Fortnite', 'Rocket League', 'CS2'];
        
        for (const canal of canais) {
            await client.query(`
                INSERT INTO chat_channels (channel_name, created_at)
                VALUES ($1, CURRENT_TIMESTAMP)
                ON CONFLICT (channel_name) DO NOTHING
            `, [canal]);
        }

        // Criar registro de feedback summary
        await client.query(`
            INSERT INTO feedback_summary (total, categories, last_update, last_feedbacks, created_at, updated_at)
            VALUES (0, '{}', NULL, '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING
        `);

        console.log('Dados padrão criados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao criar dados padrão:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function initializeDatabase() {
    try {
        await createTables();
        await createDefaultData();
        console.log('Banco de dados inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    initializeDatabase();
}

module.exports = { createTables, createDefaultData, initializeDatabase };
