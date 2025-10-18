const pool = require('../config/database');

class DatabaseService {
    // Usuários
    static async getUsers() {
        const result = await pool.query('SELECT * FROM usuarios ORDER BY created_at DESC');
        return result.rows;
    }

    static async getUserById(id) {
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async getUserByUsername(username) {
        const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [username]);
        return result.rows[0];
    }

    static async createUser(userData) {
        const { nome, usuario, senha, cargo = 'user', avatar } = userData;
        const result = await pool.query(
            'INSERT INTO usuarios (id, nome, usuario, senha, cargo, avatar, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
            [Date.now().toString(), nome, usuario, senha, cargo, avatar]
        );
        return result.rows[0];
    }

    static async updateUser(id, userData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(userData).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return await this.getUserById(id);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await pool.query(
            `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        return result.rows[0];
    }

    // Jogos
    static async getGames() {
        const result = await pool.query(`
            SELECT j.*, 
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', e.id,
                               'nome', e.nome,
                               'dia', e.dia,
                               'horario', e.horario
                           )
                       ) FILTER (WHERE e.id IS NOT NULL),
                       '[]'::json
                   ) as events
            FROM jogos j
            LEFT JOIN eventos e ON j.id = e.jogo_id
            GROUP BY j.id, j.name, j.description, j.image, j.video, j.categories, j.created_at, j.updated_at
            ORDER BY j.created_at DESC
        `);
        return result.rows;
    }

    static async getGameById(id) {
        const result = await pool.query(`
            SELECT j.*, 
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', e.id,
                               'nome', e.nome,
                               'dia', e.dia,
                               'horario', e.horario
                           )
                       ) FILTER (WHERE e.id IS NOT NULL),
                       '[]'::json
                   ) as events
            FROM jogos j
            LEFT JOIN eventos e ON j.id = e.jogo_id
            WHERE j.id = $1
            GROUP BY j.id, j.name, j.description, j.image, j.video, j.categories, j.created_at, j.updated_at
        `, [id]);
        return result.rows[0];
    }

    static async createGame(gameData) {
        const { name, desc, image, video, categories = [] } = gameData;
        const result = await pool.query(
            'INSERT INTO jogos (id, name, description, image, video, categories, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
            [Date.now().toString(), name, desc, image, video, categories]
        );
        return result.rows[0];
    }

    static async updateGame(id, gameData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(gameData).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                const dbKey = key === 'desc' ? 'description' : key;
                fields.push(`${dbKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return await this.getGameById(id);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await pool.query(
            `UPDATE jogos SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        return result.rows[0];
    }

    static async deleteGame(id) {
        const result = await pool.query('DELETE FROM jogos WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    // Squads
    static async getSquads() {
        const result = await pool.query(`
            SELECT s.*, 
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', u.id,
                               'nome', u.nome,
                               'usuario', u.usuario
                           )
                       ) FILTER (WHERE u.id IS NOT NULL),
                       '[]'::json
                   ) as integrantes
            FROM squads s
            LEFT JOIN squad_integrantes si ON s.id = si.squad_id
            LEFT JOIN usuarios u ON si.usuario_id = u.id
            GROUP BY s.id, s.nome_squad, s.jogo, s.evento_id, s.nivel, s.data_cadastro, s.created_at
            ORDER BY s.created_at DESC
        `);
        return result.rows;
    }

    static async createSquad(squadData) {
        const { nomeSquad, integrantes, jogo, eventoId, nivel } = squadData;
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Criar squad
            const squadResult = await client.query(
                'INSERT INTO squads (id, nome_squad, jogo, evento_id, nivel, data_cadastro, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
                [Date.now().toString(), nomeSquad, jogo, eventoId, nivel]
            );
            
            const squad = squadResult.rows[0];
            
            // Adicionar integrantes
            if (integrantes && integrantes.length > 0) {
                for (const integrante of integrantes) {
                    const user = await client.query('SELECT id FROM usuarios WHERE usuario = $1', [integrante]);
                    if (user.rows[0]) {
                        await client.query(
                            'INSERT INTO squad_integrantes (squad_id, usuario_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
                            [squad.id, user.rows[0].id]
                        );
                    }
                }
            }
            
            // Criar chat de grupo se houver mais de 1 integrante
            if (integrantes && integrantes.length > 1) {
                const groupChatId = Date.now().toString() + '-g';
                await client.query(
                    'INSERT INTO group_chats (id, squad_id, name, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
                    [groupChatId, squad.id, nomeSquad]
                );
                
                // Adicionar membros ao chat
                for (const integrante of integrantes) {
                    const user = await client.query('SELECT id FROM usuarios WHERE usuario = $1', [integrante]);
                    if (user.rows[0]) {
                        await client.query(
                            'INSERT INTO group_members (group_id, user_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
                            [groupChatId, user.rows[0].id]
                        );
                    }
                }
            }
            
            await client.query('COMMIT');
            return squad;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async updateSquad(id, squadData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(squadData).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                const dbKey = key === 'nomeSquad' ? 'nome_squad' : 
                             key === 'eventoId' ? 'evento_id' : 
                             key === 'dataCadastro' ? 'data_cadastro' : key;
                fields.push(`${dbKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return await this.getSquadById(id);
        }

        values.push(id);

        const result = await pool.query(
            `UPDATE squads SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        return result.rows[0];
    }

    static async getSquadById(id) {
        const result = await pool.query(`
            SELECT s.*, 
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', u.id,
                               'nome', u.nome,
                               'usuario', u.usuario
                           )
                       ) FILTER (WHERE u.id IS NOT NULL),
                       '[]'::json
                   ) as integrantes
            FROM squads s
            LEFT JOIN squad_integrantes si ON s.id = si.squad_id
            LEFT JOIN usuarios u ON si.usuario_id = u.id
            WHERE s.id = $1
            GROUP BY s.id, s.nome_squad, s.jogo, s.evento_id, s.nivel, s.data_cadastro, s.created_at
        `, [id]);
        return result.rows[0];
    }

    // Chat Channels
    static async getChatChannels() {
        const result = await pool.query(`
            SELECT cc.channel_name as name, COUNT(cm.id) as count
            FROM chat_channels cc
            LEFT JOIN channel_messages cm ON cc.id = cm.channel_id
            GROUP BY cc.id, cc.channel_name
            ORDER BY cc.channel_name
        `);
        return result.rows;
    }

    static async getChannelMessages(channelName) {
        const result = await pool.query(`
            SELECT cm.*
            FROM channel_messages cm
            JOIN chat_channels cc ON cm.channel_id = cc.id
            WHERE cc.channel_name = $1
            ORDER BY cm.created_at ASC
        `, [channelName]);
        return result.rows;
    }

    static async createChannelMessage(channelName, messageData) {
        const { messageId, userId, username, text, role, avatar, reactions = {} } = messageData;
        
        const client = await pool.connect();
        try {
            // Garantir que o canal existe
            await client.query(
                'INSERT INTO chat_channels (channel_name, created_at) VALUES ($1, CURRENT_TIMESTAMP) ON CONFLICT (channel_name) DO NOTHING',
                [channelName]
            );
            
            // Obter ID do canal
            const channelResult = await client.query('SELECT id FROM chat_channels WHERE channel_name = $1', [channelName]);
            const channelId = channelResult.rows[0].id;
            
            // Inserir mensagem
            const result = await client.query(
                'INSERT INTO channel_messages (message_id, channel_id, user_id, username, text, role, avatar, reactions, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
                [messageId, channelId, userId, username, text, role, avatar, JSON.stringify(reactions)]
            );
            
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async clearChannelMessages(channelName) {
        const result = await pool.query(`
            DELETE FROM channel_messages 
            WHERE channel_id = (SELECT id FROM chat_channels WHERE channel_name = $1)
        `, [channelName]);
        return result.rowCount;
    }

    static async updateMessageReactions(channelName, messageId, reactions) {
        const result = await pool.query(`
            UPDATE channel_messages 
            SET reactions = $3
            WHERE message_id = $2 
            AND channel_id = (SELECT id FROM chat_channels WHERE channel_name = $1)
            RETURNING *
        `, [channelName, messageId, JSON.stringify(reactions)]);
        return result.rows[0];
    }

    // Private Chats
    static async getPrivateChat(userA, userB) {
        const result = await pool.query(`
            SELECT pc.*, 
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'messageId', pm.message_id,
                               'id', pm.user_id,
                               'username', pm.username,
                               'text', pm.text,
                               'time', pm.created_at
                           )
                       ) FILTER (WHERE pm.id IS NOT NULL),
                       '[]'::json
                   ) as messages
            FROM private_chats pc
            LEFT JOIN private_messages pm ON pc.id = pm.chat_id
            WHERE (pc.user_a = $1 AND pc.user_b = $2) OR (pc.user_a = $2 AND pc.user_b = $1)
            GROUP BY pc.id, pc.user_a, pc.user_b, pc.created_at
        `, [userA, userB]);
        
        if (result.rows.length === 0) {
            // Criar novo chat privado
            const newChatResult = await pool.query(
                'INSERT INTO private_chats (user_a, user_b, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
                [userA, userB]
            );
            return { ...newChatResult.rows[0], messages: [] };
        }
        
        return result.rows[0];
    }

    static async createPrivateMessage(userA, userB, messageData) {
        const { messageId, userId, username, text } = messageData;
        
        const client = await pool.connect();
        try {
            // Garantir que o chat existe
            let chatResult = await client.query(`
                SELECT id FROM private_chats 
                WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)
            `, [userA, userB]);
            
            let chatId;
            if (chatResult.rows.length === 0) {
                const newChatResult = await client.query(
                    'INSERT INTO private_chats (user_a, user_b, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id',
                    [userA, userB]
                );
                chatId = newChatResult.rows[0].id;
            } else {
                chatId = chatResult.rows[0].id;
            }
            
            // Inserir mensagem
            const result = await client.query(
                'INSERT INTO private_messages (message_id, chat_id, user_id, username, text, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
                [messageId, chatId, userId, username, text]
            );
            
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    // Group Chats
    static async getUserGroups(userId) {
        const result = await pool.query(`
            SELECT gc.id, gc.name, gc.squad_id, 
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', gm.user_id
                           )
                       ) FILTER (WHERE gm.user_id IS NOT NULL),
                       '[]'::json
                   ) as members
            FROM group_chats gc
            JOIN group_members gm ON gc.id = gm.group_id
            WHERE gm.user_id = $1
            GROUP BY gc.id, gc.name, gc.squad_id
        `, [userId]);
        return result.rows;
    }

    static async getGroupMessages(groupId) {
        const result = await pool.query(`
            SELECT gm.*
            FROM group_messages gm
            WHERE gm.group_id = $1
            ORDER BY gm.created_at ASC
        `, [groupId]);
        return result.rows;
    }

    static async createGroupMessage(groupId, messageData) {
        const { messageId, userId, username, text } = messageData;
        
        const result = await pool.query(
            'INSERT INTO group_messages (message_id, group_id, user_id, username, text, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
            [messageId, groupId, userId, username, text]
        );
        return result.rows[0];
    }

    // Social Features
    static async getUserStatus(userId) {
        const result = await pool.query('SELECT status FROM user_statuses WHERE user_id = $1', [userId]);
        return result.rows[0]?.status || 'Disponível';
    }

    static async updateUserStatus(userId, status) {
        const result = await pool.query(
            'INSERT INTO user_statuses (user_id, status, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET status = $2, updated_at = CURRENT_TIMESTAMP RETURNING *',
            [userId, status]
        );
        return result.rows[0];
    }

    static async getOnlineUsers() {
        const result = await pool.query(`
            SELECT u.id, u.nome as username, COALESCE(us.status, 'Disponível') as status
            FROM usuarios u
            LEFT JOIN user_statuses us ON u.id = us.user_id
            WHERE COALESCE(us.status, 'Disponível') != 'Invisível'
            ORDER BY u.nome
        `);
        return result.rows;
    }

    static async createFriendRequest(senderId, receiverId) {
        const result = await pool.query(
            'INSERT INTO friend_requests (id, sender_id, receiver_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
            [Date.now().toString(), senderId, receiverId, 'pendente']
        );
        return result.rows[0];
    }

    static async getFriendRequests(userId) {
        const incomingResult = await pool.query(
            'SELECT * FROM friend_requests WHERE receiver_id = $1 AND status = $2 ORDER BY created_at DESC',
            [userId, 'pendente']
        );
        
        const outgoingResult = await pool.query(
            'SELECT * FROM friend_requests WHERE sender_id = $1 AND status = $2 ORDER BY created_at DESC',
            [userId, 'pendente']
        );
        
        return {
            incoming: incomingResult.rows,
            outgoing: outgoingResult.rows
        };
    }

    static async acceptFriendRequest(requestId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Obter dados da solicitação
            const requestResult = await client.query('SELECT * FROM friend_requests WHERE id = $1', [requestId]);
            if (requestResult.rows.length === 0) {
                throw new Error('Solicitação não encontrada');
            }
            
            const request = requestResult.rows[0];
            
            // Atualizar status da solicitação
            await client.query(
                'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['aceito', requestId]
            );
            
            // Criar amizade
            await client.query(
                'INSERT INTO friendships (id, user_id, friend_id, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
                [Date.now().toString(), request.sender_id, request.receiver_id]
            );
            
            await client.query('COMMIT');
            return request;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async declineFriendRequest(requestId) {
        const result = await pool.query(
            'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            ['recusado', requestId]
        );
        return result.rows[0];
    }

    static async cancelFriendRequest(requestId) {
        const result = await pool.query(
            'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            ['cancelado', requestId]
        );
        return result.rows[0];
    }

    static async getUserFriends(userId) {
        const result = await pool.query(`
            SELECT u.id, u.nome as username, COALESCE(us.status, 'Disponível') as status, u.avatar
            FROM friendships f
            JOIN usuarios u ON f.friend_id = u.id
            LEFT JOIN user_statuses us ON u.id = us.user_id
            WHERE f.user_id = $1
            ORDER BY u.nome
        `, [userId]);
        return result.rows;
    }

    static async removeFriendship(userId, friendId) {
        const result = await pool.query(
            'DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2',
            [userId, friendId]
        );
        return result.rowCount > 0;
    }

    static async searchUsers(query, excludeId) {
        const result = await pool.query(`
            SELECT id, usuario as username
            FROM usuarios
            WHERE (usuario ILIKE $1 OR nome ILIKE $1) AND id != $2
            ORDER BY usuario
            LIMIT 20
        `, [`%${query}%`, excludeId]);
        return result.rows;
    }

    // Moderation
    static async getUserModerationData(userId) {
        const result = await pool.query('SELECT * FROM moderation_users WHERE user_id = $1', [userId]);
        return result.rows[0];
    }

    static async updateUserModerationData(userId, data) {
        const { infractions, blockUntil } = data;
        const result = await pool.query(
            'INSERT INTO moderation_users (user_id, infractions, block_until, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET infractions = $2, block_until = $3, updated_at = CURRENT_TIMESTAMP RETURNING *',
            [userId, JSON.stringify(infractions), blockUntil]
        );
        return result.rows[0];
    }

    // Feedback
    static async getFeedbackSummary() {
        const result = await pool.query('SELECT * FROM feedback_summary ORDER BY id DESC LIMIT 1');
        return result.rows[0];
    }

    static async updateFeedbackSummary(summaryData) {
        const { total, categories, lastUpdate, lastFeedbacks } = summaryData;
        const result = await pool.query(
            'INSERT INTO feedback_summary (total, categories, last_update, last_feedbacks, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO UPDATE SET total = $1, categories = $2, last_update = $3, last_feedbacks = $4, updated_at = CURRENT_TIMESTAMP RETURNING *',
            [total, JSON.stringify(categories), lastUpdate, JSON.stringify(lastFeedbacks)]
        );
        return result.rows[0];
    }
}

module.exports = DatabaseService;
