const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const app = express();

const serverIP = process.env.REACT_APP_API_URL ? 
  process.env.REACT_APP_API_URL.match(/https:\/\/([^:]+):/)?.[1] : 
  '192.168.0.141';

app.use(express.static(path.join(__dirname, '../build')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/verify', (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Code is required');
  }
  res.send('Code verified');
});

app.get('/ca.crt', (req, res) => {
  res.download(path.join(__dirname, `../public/${serverIP}+1.pem`));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});