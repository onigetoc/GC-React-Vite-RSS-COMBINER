import express from 'express';
import cors from 'cors';
import combineRSSRouter from './api/combine-rss.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log('Requête reçue:', req.method, req.url, req.body);
  next();
});

// Utiliser le routeur au lieu de la route de test
app.use('/combine-rss', combineRSSRouter);

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
