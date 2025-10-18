const express = require('express');
const router = express.Router();
const DatabaseService = require('../services/databaseService');

router.get('/', async (req, res) => {
  try {
    const squads = await DatabaseService.getSquads();
    res.json(squads);
  } catch (error) {
    console.error('Erro ao listar squads:', error);
    res.status(500).json({ error: 'Erro ao listar squads' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { integrantes = [], jogo, eventoId } = req.body || {};

    // Validação básica de campos obrigatórios
    if (!jogo || !eventoId) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes (jogo, eventoId).' });
    }

    // Garantir array
    if (!Array.isArray(integrantes) || integrantes.length === 0) {
      return res.status(400).json({ error: 'Informe ao menos um integrante.' });
    }

    // Verificar se os usuários existem
    const usuariosValidos = [];
    for (const integrante of integrantes) {
      const user = await DatabaseService.getUserByUsername(integrante.trim());
      if (!user) {
        return res.status(400).json({
          error: 'Usuário não foi encontrado.',
          mensagem: 'Um ou mais usuários informados não existem no sistema.',
          usuariosInvalidos: [integrante]
        });
      }
      usuariosValidos.push(user);
    }

    const novoSquad = await DatabaseService.createSquad({
      nomeSquad: req.body.nomeSquad,
      integrantes,
      jogo,
      eventoId,
      nivel: req.body.nivel
    });

    res.status(201).json(novoSquad);
  } catch (error) {
    console.error('Erro ao criar squad:', error);
    res.status(500).json({ error: 'Erro ao criar squad' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const squad = await DatabaseService.getSquadById(req.params.id);
    if (!squad) return res.status(404).json({ error: 'Squad não encontrado' });
    
    const squadAtualizado = await DatabaseService.updateSquad(req.params.id, req.body);
    res.json(squadAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar squad:', error);
    res.status(500).json({ error: 'Erro ao atualizar squad' });
  }
});

module.exports = router;