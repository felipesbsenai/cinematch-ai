import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes/api.routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Parse incoming JSON bodies
  app.use(express.json());

  // Mount API endpoints
  app.use('/api', apiRouter);

  if (!isProd) {
    // Development mode: Vite dev server with middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[CineMatch AI] Fullstack Server running at http://localhost:${PORT}`);
    console.log(`[CineMatch AI] API routes mounted at http://localhost:${PORT}/api`);
    console.log(`[CineMatch AI] TMDB integration: ${process.env.TMDB_API_KEY ? 'Active (TMDB API)' : 'Ready (Awaiting TMDB_API_KEY)'}`);
    console.log(`[CineMatch AI] Gemini AI integration: ${process.env.GEMINI_API_KEY ? 'Active (Gemini 2.5 Flash)' : 'Ready (Awaiting GEMINI_API_KEY)'}`);
  });
}

startServer().catch((err) => {
  console.error('[CineMatch AI] Fatal server error:', err);
  process.exit(1);
});
