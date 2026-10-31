import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

console.log('[Verilar] Iniciando processo Node.js...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFilePath = path.resolve(__dirname, '.env');
if (fs.existsSync(envFilePath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envFilePath);
  } catch {
    // Segue com defaults locais caso o .env tenha formatação inválida
  }
}

function listenWithFallback(
  server: http.Server,
  initialPort: number,
  allowFallback: boolean
): Promise<number> {
  return new Promise((resolve, reject) => {
    let currentPort = initialPort;
    const maxPort = initialPort + 5;

    const onError = (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && allowFallback && currentPort < maxPort) {
        console.warn(
          `[Verilar] Porta ${currentPort} já está em uso. Tentando porta ${currentPort + 1}...`
        );
        currentPort += 1;
        server.listen(currentPort, '0.0.0.0');
        return;
      }
      server.off('error', onError);
      reject(err);
    };

    server.on('error', onError);
    server.listen(currentPort, '0.0.0.0', () => {
      server.off('error', onError);
      resolve(currentPort);
    });
  });
}

async function startServer() {
  console.log('[Verilar] 1/4 Inicializando banco SQLite local...');
  const { initializeSchemaDDL } = await import('./src/db/index.ts');
  const { seedDatabaseIfEmpty } = await import('./src/db/seed.ts');
  initializeSchemaDDL();
  seedDatabaseIfEmpty();

  console.log('[Verilar] 2/4 Carregando servidor Express e rotas da API...');
  const [{ default: express }, { default: cookieParser }, { apiRouter }] = await Promise.all([
    import('express'),
    import('cookie-parser'),
    import('./src/server/routes.ts'),
  ]);

  const app = express();
  const httpServer = http.createServer(app);
  const preferredPort = Number(process.env.PORT) || 3000;
  const isProduction =
    process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
  const disableHmr = process.env.DISABLE_HMR === 'true';

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Mount REST API routes BEFORE Vite / static SPA middleware
  app.use('/api/v1', apiRouter);

  // Return JSON 404 for unknown /api routes instead of falling through to index.html
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint de API não encontrado.' });
  });

  // Frontend serving (Vite middleware in dev, dist static in production)
  if (!isProduction) {
    console.log('[Verilar] 3/4 Carregando interface web (Vite)...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: { server: httpServer },
        hmr: !disableHmr,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Verilar] 3/4 Servindo arquivos estáticos compilados (dist)...');
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const allowPortFallback = !process.env.PORT && !disableHmr;
  const activePort = await listenWithFallback(httpServer, preferredPort, allowPortFallback);

  console.log(
    `[Verilar] 4/4 Pronto! Abra no navegador: http://localhost:${activePort}`
  );
}

startServer().catch((err) => {
  console.error('[Verilar] Falha ao iniciar o servidor:', err);
  process.exit(1);
});
