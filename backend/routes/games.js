const express = require('express');
const router = express.Router();
const DatabaseService = require('../services/databaseService');

router.get('/', async (req, res) => {
    try {
        const games = await DatabaseService.getGames();
        res.json(games);
    } catch (error) {
        console.error('Erro ao listar jogos:', error);
        res.status(500).json({ error: 'Erro ao listar jogos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, desc, image, video, categories = [] } = req.body || {};
        const novoJogo = await DatabaseService.createGame({
            name,
            desc,
            image,
            video,
            categories
        });
        res.status(201).json(novoJogo);
    } catch (error) {
        console.error('Erro ao criar jogo:', error);
        res.status(500).json({ error: 'Erro ao criar jogo' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const jogo = await DatabaseService.getGameById(req.params.id);
        if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });
        
        const jogoAtualizado = await DatabaseService.updateGame(req.params.id, req.body);
        res.json(jogoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar jogo:', error);
        res.status(500).json({ error: 'Erro ao atualizar jogo' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const jogo = await DatabaseService.deleteGame(req.params.id);
        if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });
        res.json(jogo);
    } catch (error) {
        console.error('Erro ao deletar jogo:', error);
        res.status(500).json({ error: 'Erro ao deletar jogo' });
    }
});

module.exports = router;
