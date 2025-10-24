const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const pool = require('../config/database');

const [, , usernameArg, outputArg] = process.argv;
const username = (usernameArg || '').trim();

if (!username) {
  console.error('Uso: node backend/scripts/exportFaceImage.js <username> [outputBase]');
  console.error('Exemplo: node backend/scripts/exportFaceImage.js SuperAdmin exports/SuperAdmin-face');
  process.exit(1);
}

const baseOutputPath = path.resolve(outputArg || `${username}-face`);

const ensureDir = (targetPath) => {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

(async () => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT id, face_data, face_image
      FROM usuarios
      WHERE usuario = $1
      ORDER BY id
      LIMIT 1
    `;
    const { rows } = await client.query(query, [username]);

    if (!rows.length) {
      console.error(`Usuário "${username}" não encontrado.`);
      process.exitCode = 1;
      return;
    }

    const row = rows[0];
    const faceImage = row.face_image;
    const faceMetadata = row.face_data ? (typeof row.face_data === 'string' ? JSON.parse(row.face_data) : row.face_data) : null;

    if (faceImage) {
      const imagePath = path.extname(baseOutputPath)
        ? baseOutputPath
        : `${baseOutputPath}.jpg`;
      ensureDir(imagePath);
      fs.writeFileSync(imagePath, faceImage);
      console.log(`Imagem facial exportada com sucesso para: ${imagePath}`);

      if (faceMetadata) {
        const metaPath = path.extname(baseOutputPath)
          ? `${baseOutputPath}.json`
          : `${baseOutputPath}.metadata.json`;
        ensureDir(metaPath);
        fs.writeFileSync(metaPath, JSON.stringify(faceMetadata, null, 2), 'utf8');
        console.log(`Metadados exportados para: ${metaPath}`);
      }
    } else if (faceMetadata) {
      const metadataPath = path.extname(baseOutputPath)
        ? baseOutputPath
        : `${baseOutputPath}.json`;
      ensureDir(metadataPath);
      fs.writeFileSync(metadataPath, JSON.stringify(faceMetadata, null, 2), 'utf8');
      console.log('Nenhuma imagem binária encontrada. Metadados exportados para:', metadataPath);
    } else {
      console.error(`Usuário "${username}" não possui dados faciais armazenados.`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Erro ao exportar face_data:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
