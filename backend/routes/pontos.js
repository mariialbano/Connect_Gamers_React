const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Obter pontos de um usuário
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await pool.query(
            'SELECT id, nome, usuario, pontos FROM usuarios WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({
            userId: result.rows[0].id,
            username: result.rows[0].usuario,
            name: result.rows[0].nome,
            points: result.rows[0].pontos || 0
        });
    } catch (error) {
        console.error('Erro ao buscar pontos:', error);
        res.status(500).json({ error: 'Erro ao buscar pontos do usuário' });
    }
});

// POST - Adicionar pontos a um usuário
router.post('/add', async (req, res) => {
    try {
        const { userId, points, reason } = req.body;

        if (!userId || !points) {
            return res.status(400).json({ error: 'userId e points são obrigatórios' });
        }

        const result = await pool.query(
            'UPDATE usuarios SET pontos = COALESCE(pontos, 0) + $1 WHERE id = $2 RETURNING id, usuario, pontos',
            [points, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({
            success: true,
            userId: result.rows[0].id,
            username: result.rows[0].usuario,
            newPoints: result.rows[0].pontos,
            addedPoints: points,
            reason: reason || 'Pontos adicionados'
        });
    } catch (error) {
        console.error('Erro ao adicionar pontos:', error);
        res.status(500).json({ error: 'Erro ao adicionar pontos' });
    }
});

// GET - Ranking de pontos (top usuários)
router.get('/ranking/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const result = await pool.query(
            'SELECT id, nome, usuario, pontos FROM usuarios WHERE pontos > 0 ORDER BY pontos DESC LIMIT $1',
            [limit]
        );

        res.json(result.rows.map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            name: user.nome,
            username: user.usuario,
            points: user.pontos || 0
        })));
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ error: 'Erro ao buscar ranking de pontos' });
    }
});

module.exports = router;
