const express = require('express');
const router = express.Router();

const topPlayers = [
    { name: "Player1", kdr: 4.2 },
    { name: "Player2", kdr: 3.9 },
    { name: "Player3", kdr: 3.7 },
    { name: "Player4", kdr: 3.5 },
    { name: "Player5", kdr: 3.4 }
];

router.get('/', (req, res) => {
    res.json(topPlayers);
});

module.exports = router;