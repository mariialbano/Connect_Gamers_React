const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const pool = require('../config/database');
const facePlusPlusService = require('../services/facePlusPlusService');

let faceColumnsEnsured = false;

/**
 * Garante que as colunas necessárias existem na tabela usuarios
 */
async function ensureFaceColumns() {
    if (faceColumnsEnsured) return;
    try {
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS face_image BYTEA,
            ADD COLUMN IF NOT EXISTS face_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS status_verificacao BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS data_verificacao TIMESTAMP
        `);
        faceColumnsEnsured = true;
        console.log('✅ Colunas de verificação facial garantidas');
    } catch (err) {
        console.error('⚠️ Erro ao garantir colunas faciais:', err.message);
    }
}

// Configuração do multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    }
});

// Função para limpar tokens expirados
async function cleanExpiredTokens() {
    try {
        await pool.query('DELETE FROM verification_tokens WHERE expires_at < NOW()');
    } catch (error) {
        console.error('Erro ao limpar tokens expirados:', error);
    }
}

// Rota para gerar QR Code de verificação
router.post('/generate-qr', async (req, res) => {
    try {
        const { userId, username } = req.body || {};

        if (!userId && !username) {
            return res.status(400).json({ error: 'ID do usuário ou username é obrigatório' });
        }

        // Verificar se o usuário existe
        let user = null;
        if (userId) {
            const byId = await pool.query('SELECT id, status_verificacao FROM usuarios WHERE id = $1', [userId]);
            if (byId.rows.length > 0) {
                user = byId.rows[0];
            }
        }

        // Fallback: procurar por username (case-insensitive)
        if (!user && username) {
            const byUsername = await pool.query('SELECT id, status_verificacao FROM usuarios WHERE lower(usuario) = lower($1) LIMIT 1', [username]);
            if (byUsername.rows.length > 0) {
                user = byUsername.rows[0];
            }
        }

        if (!user) {
            console.warn('⚠️ generate-qr: usuário não encontrado. Recebido =>', { userId, username });
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        if (user.status_verificacao) {
            return res.status(400).json({ error: 'Usuário já está verificado' });
        }

        // Limpar tokens expirados
        await cleanExpiredTokens();

        // Verificar se já existe um token válido para este usuário
        const existingTokenResult = await pool.query(
            'SELECT token FROM verification_tokens WHERE user_id = $1 AND expires_at > NOW() AND used = false',
            [user.id]
        );

    let token;

        if (existingTokenResult.rows.length > 0) {
            // Usar token existente
            token = existingTokenResult.rows[0].token;
        } else {
            // Criar novo token
            token = uuidv4();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

            await pool.query(
                'INSERT INTO verification_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
                [token, user.id, expiresAt]
            );
        }

        // Gerar QR Code apontando para o backend na porta 5000 (faceid.html)
        const origin = `${req.protocol}://${req.get('host')}`;
        const verificationUrl = `${origin}/faceid/${token}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

        res.json({
            success: true,
            qrCode: qrCodeDataUrl,
            token: token,
            verificationUrl,
            expiresIn: 5 * 60 * 1000 // 5 minutos em millisegundos
        });

    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para verificar token
router.get('/verify-token/:token', async (req, res) => {
    try {
        console.log('🔍 [VERIFY-TOKEN] Requisição recebida:', { 
            token: req.params.token?.substring(0, 8) + '...', 
            ip: req.ip,
            origin: req.get('origin')
        });
        
        const { token } = req.params;

        if (!token) {
            console.log('❌ [VERIFY-TOKEN] Token não fornecido');
            return res.status(400).json({ error: 'Token é obrigatório' });
        }

        // Limpar tokens expirados
        await cleanExpiredTokens();

        // Verificar se o token existe e é válido
        const tokenResult = await pool.query(
            `SELECT vt.*, u.nome, u.usuario 
             FROM verification_tokens vt 
             JOIN usuarios u ON vt.user_id = u.id 
             WHERE vt.token = $1 AND vt.expires_at > NOW() AND vt.used = false`,
            [token]
        );

        if (tokenResult.rows.length === 0) {
            console.log('❌ [VERIFY-TOKEN] Token inválido ou expirado:', token.substring(0, 8) + '...');
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        const tokenData = tokenResult.rows[0];
        console.log('✅ [VERIFY-TOKEN] Token válido para usuário:', tokenData.usuario);

        res.json({
            success: true,
            user: {
                id: tokenData.user_id,
                nome: tokenData.nome,
                usuario: tokenData.usuario
            },
            token: token
        });

    } catch (error) {
        console.error('❌ [VERIFY-TOKEN] Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para upload e verificação facial
router.post('/face-verification', upload.single('photo'), async (req, res) => {
    try {
        await ensureFaceColumns();

        const { token } = req.body;
        const photoBuffer = req.file?.buffer;

        if (!token) {
            return res.status(400).json({ error: 'Token é obrigatório' });
        }

        if (!photoBuffer) {
            return res.status(400).json({ error: 'Foto é obrigatória' });
        }

        // Validar token
        const tokenResult = await pool.query(
            `SELECT vt.*, u.id as user_id, u.usuario, u.nome, u.face_token, u.status_verificacao
             FROM verification_tokens vt
             INNER JOIN usuarios u ON vt.user_id = u.id
             WHERE vt.token = $1 AND vt.expires_at > NOW() AND vt.used = false`,
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(404).json({ error: 'Token inválido ou expirado' });
        }

        const userData = tokenResult.rows[0];

        if (userData.status_verificacao) {
            return res.status(400).json({ error: 'Usuário já está verificado' });
        }

        // 1. Detectar face na imagem enviada usando Face++
        console.log('🔍 Detectando face na imagem...');
        const detectionResult = await facePlusPlusService.detectFace(photoBuffer);
        const newFaceToken = detectionResult.face_token;

        console.log(`✅ Face detectada! Token: ${newFaceToken}`);

        // 2. Buscar se já existe algum usuário verificado com face similar
        console.log('🔍 Verificando se face já existe em outra conta...');
        
        const allVerifiedUsers = await pool.query(
            'SELECT id, usuario, nome, face_token FROM usuarios WHERE status_verificacao = true AND face_token IS NOT NULL AND id != $1',
            [userData.user_id]
        );

        // Comparar com todas as faces verificadas
        for (const verifiedUser of allVerifiedUsers.rows) {
            try {
                const comparison = await facePlusPlusService.compareFaces(newFaceToken, verifiedUser.face_token);
                
                if (comparison.isMatch) {
                    console.warn(`⚠️ Face duplicada encontrada! Match com usuário: ${verifiedUser.usuario} (${comparison.similarity_percentage}%)`);
                    return res.status(409).json({
                        error: 'Esta face já está registrada em outra conta',
                        message: 'Detectamos que este rosto já foi usado para verificação de outra conta. Cada pessoa pode ter apenas uma conta verificada.',
                        existingUser: verifiedUser.usuario,
                        confidence: comparison.similarity_percentage,
                        duplicate: true
                    });
                }
            } catch (compareError) {
                console.warn(`⚠️ Erro ao comparar com usuário ${verifiedUser.usuario}:`, compareError.message);
                // Continua verificando outros usuários
            }
        }

        console.log('✅ Nenhuma face duplicada encontrada!');

        // 3. Salvar face_token + imagem e marcar como verificado
        await pool.query(
            `UPDATE usuarios 
             SET face_token = $1, 
                 face_image = $2, 
                 status_verificacao = true, 
                 data_verificacao = NOW(),
                 is_verified = true,
                 updated_at = NOW()
             WHERE id = $3`,
            [newFaceToken, photoBuffer, userData.user_id]
        );

        // Marcar token como usado
        await pool.query(
            'UPDATE verification_tokens SET used = true WHERE token = $1',
            [token]
        );

        console.log(`✅ Usuário ${userData.usuario} verificado com sucesso!`);

        res.json({
            success: true,
            message: 'Verificação facial concluída com sucesso',
            user: {
                id: userData.user_id,
                usuario: userData.usuario,
                nome: userData.nome,
                verificado: true
            }
        });

    } catch (error) {
        console.error('❌ Erro na verificação facial:', error);
        
        // Erros específicos da API Face++
        if (error.message.includes('Face++')) {
            return res.status(400).json({ 
                error: 'Erro ao processar face: ' + error.message,
                hint: 'Certifique-se de que a foto está clara e contém um rosto visível'
            });
        }

        res.status(500).json({ error: 'Erro na verificação facial: ' + error.message });
    }
});

// Rota para obter status de verificação do usuário
router.get('/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const userResult = await pool.query(
            'SELECT id, usuario, nome, status_verificacao, data_verificacao, face_token FROM usuarios WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = userResult.rows[0];

        res.json({
            success: true,
            userId: user.id,
            usuario: user.usuario,
            nome: user.nome,
            verificado: user.status_verificacao || false,
            dataVerificacao: user.data_verificacao,
            hasFaceData: !!user.face_token
        });

    } catch (error) {
        console.error('Erro ao obter status de verificação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;