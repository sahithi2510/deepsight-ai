import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/api';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

async function startServer() {
  // 1. Mount API Router for /api/* endpoints
  app.use('/api', apiRouter);

  // 2. Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind exclusively to 0.0.0.0:3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express Gateway] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Express Gateway] Startup failure:', err);
});

