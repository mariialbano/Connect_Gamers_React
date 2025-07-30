const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users'); 
const squadsRouter = require('./routes/squads');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('json spaces', 2);

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usersRouter);
app.use('/api/squads', squadsRouter);

app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});