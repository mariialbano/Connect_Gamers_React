const express = require('express');
const router = express.Router();

// Mock de eventos organizados por jogo
const eventosTeste = {
    "Valorant": [
        { id: 1, nome: "Spike Rush", dia: "Sábado", horario: "13:00 às 15:00" },
        { id: 2, nome: "Competitivo", dia: "Domingo", horario: "16:00 às 18:00" },
        { id: 3, nome: "Deathmatch", dia: "Sexta", horario: "20:00 às 22:00" },
    ],
    "Rocket League": [
        { id: 4, nome: "Duplas", dia: "Quarta", horario: "10:00 às 12:00" },
        { id: 5, nome: "Trio", dia: "Sábado", horario: "15:00 às 17:00" },
        { id: 6, nome: "1x1", dia: "Domingo", horario: "09:00 às 11:00" },
    ],
    "League of Legends": [
        { id: 7, nome: "5v5 Tradicional", dia: "Sábado", horario: "14:00 às 16:00" },
        { id: 8, nome: "ARAM", dia: "Domingo", horario: "17:00 às 19:00" },
        { id: 9, nome: "TFT", dia: "Segunda", horario: "20:00 às 22:00" },
    ],
    "Fortnite": [
        { id: 10, nome: "Solo", dia: "Sábado", horario: "12:00 às 14:00" },
        { id: 11, nome: "Duplas", dia: "Sábado", horario: "15:00 às 17:00" },
        { id: 12, nome: "Squad", dia: "Domingo", horario: "18:00 às 20:00" },
    ],
    "Counter Strike 2": [
        { id: 13, nome: "5v5 Competitivo", dia: "Sábado", horario: "13:00 às 15:00" },
        { id: 14, nome: "2v2 Wingman", dia: "Domingo", horario: "16:00 às 18:00" },
        { id: 15, nome: "Modo Casual", dia: "Sexta", horario: "19:00 às 21:00" },
    ],
};

router.get('/', (req, res) => {
    res.json(eventosTeste);
});

module.exports = router;