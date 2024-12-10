import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import combineRSSRouter from './api/combine-rss.js';
import path from 'path';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log('Requête reçue:', req.method, req.url, req.body);
  next();
});

// Servir le dossier 'generated' statiquement
app.use('/generated', express.static(path.join(__dirname, 'generated')));

// Utiliser le routeur au lieu de la route de test
app.use('/combine-rss', combineRSSRouter);

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
