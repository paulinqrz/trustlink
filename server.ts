import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { initializeSchemaDDL } from './src/db/index.ts';
import { seedDatabaseIfEmpty } from './src/db/seed.ts';
import { apiRouter } from './src/server/routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // 1. Initialize SQLite schema + triggers and seed initial demo data if empty
  initializeSchemaDDL();
  seedDatabaseIfEmpty();

  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // 2. Mount REST API routes BEFORE Vite / static SPA middleware
  app.use('/api/v1', apiRouter);

  // Return JSON 404 for unknown /api routes instead of falling through to index.html
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint de API não encontrado.' });
  });

  // 3. Frontend serving (Vite middleware in dev, dist static in production)
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(
      `[Verilar] Servidor unificado (Express + SQLite + Frontend) rodando em http://localhost:${port}`
    );
  });
}

startServer().catch((err) => {
  console.error('[Verilar] Falha ao iniciar o servidor:', err);
  process.exit(1);
});
