const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();
const app = express();

// Função para detectar IP da rede local automaticamente
function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Pular endereços internos e não IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        // Priorizar 192.168.0.* ou qualquer 192.168.*
        if (iface.address.startsWith('192.168.0.') || iface.address.startsWith('192.168.')) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost'; // Fallback
}

const serverIP = process.env.REACT_APP_API_URL ? 
  process.env.REACT_APP_API_URL.match(/https:\/\/([^:]+):/)?.[1] : 
  getLocalNetworkIP();

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
  res.download(path.join(__dirname, `../ssl/${serverIP}+1.pem`));
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});