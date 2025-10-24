-- Criar tabelas do Connect Gamers
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
    face_token VARCHAR(255),
    status_verificacao BOOLEAN DEFAULT FALSE,
    data_verificacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jogos (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    video VARCHAR(500),
    categories TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    jogo_id VARCHAR(50) REFERENCES jogos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    dia VARCHAR(50),
    horario VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS squads (
    id VARCHAR(50) PRIMARY KEY,
    nome_squad VARCHAR(255) NOT NULL,
    jogo VARCHAR(255) NOT NULL,
    evento_id INTEGER REFERENCES eventos(id),
    nivel VARCHAR(50),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS squad_integrantes (
    id SERIAL PRIMARY KEY,
    squad_id VARCHAR(50) REFERENCES squads(id) ON DELETE CASCADE,
    usuario_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(squad_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS chat_channels (
    id SERIAL PRIMARY KEY,
    channel_name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
);

CREATE TABLE IF NOT EXISTS private_chats (
    id SERIAL PRIMARY KEY,
    user_a VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    user_b VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_a, user_b)
);

CREATE TABLE IF NOT EXISTS private_messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(50) UNIQUE NOT NULL,
    chat_id INTEGER REFERENCES private_chats(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    username VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_chats (
    id VARCHAR(50) PRIMARY KEY,
    squad_id VARCHAR(50) REFERENCES squads(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(50) REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(50) UNIQUE NOT NULL,
    group_id VARCHAR(50) REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    username VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_statuses (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Disponível',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS friend_requests (
    id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    receiver_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS friendships (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    friend_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar SuperAdmin
INSERT INTO usuarios (id, nome, usuario, senha, cargo, created_at, updated_at)
VALUES ('superadmin', 'Super Administrador', 'SuperAdmin', 
        '$2b$10$rN.zJPzVQg6kYxGxNBX8o.FJGZo4GVNKGqVwxH3h.kP1Fqo.5tJ2W', 
        'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (usuario) DO NOTHING;
