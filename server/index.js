import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { testConnection, initDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import selectionsRoutes from './routes/selections.js';
import uploadsRoutes from './routes/uploads.js';

// Carrega variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rotas da API (Devem vir ANTES dos arquivos estáticos)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/selections', selectionsRoutes);
app.use('/api/uploads', uploadsRoutes);

// Servir arquivos estáticos do React (Frontend)
const buildPath = path.join(__dirname, '../dist');
app.use(express.static(buildPath));

// Servir arquivos públicos (assets, PDFs)
const publicPath = path.join(__dirname, '../public');
app.use('/assets', express.static(path.join(publicPath, 'assets')));
app.use('/projetos', express.static(path.join(publicPath, 'projetos')));

// Servir Volume do Railway (/downloads)
const downloadsPath = process.env.NODE_ENV === 'production' ? '/downloads' : path.join(__dirname, '../downloads');
if (!fs.existsSync(downloadsPath)) {
  try {
    fs.mkdirSync(downloadsPath, { recursive: true });
  } catch (err) {
    console.warn(`⚠️ Não foi possível criar ${downloadsPath}:`, err.message);
  }
}
app.use('/downloads', express.static(downloadsPath));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Qualquer outra rota serve o Frontend (React)
app.get('*', (req, res) => {
  // Se for uma rota de API que não existe, retorna 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota de API não encontrada' });
  }
  // Caso contrário, serve o index.html do React
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Inicializa o servidor
async function startServer() {
  try {
    // Se não houver DATABASE_URL, o servidor não deve tentar conectar ou falhar graciosamente
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL não configurada. O servidor funcionará de forma limitada.');
      
      // Inicia o servidor sem banco de dados (opcional, dependendo da necessidade)
      app.listen(PORT, () => {
        console.log(`\n🚀 Servidor rodando em modo limitado (sem DB) na porta ${PORT}`);
      });
      return;
    }

    // Testa a conexão com o banco de dados
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      // Em desenvolvimento, talvez não queiramos dar exit se estivermos apenas testando o frontend
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }

    // Inicializa as tabelas
    await initDatabase();

    // Inicia o servidor
    app.listen(PORT, async () => {
      console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);

      // Executa migração automática se estiver em produção ou se o banco estiver vazio
      if (process.env.AUTO_MIGRATE === 'true' || process.env.NODE_ENV === 'production') {
        try {
          console.log('🔄 Iniciando migração automática de dados...');
          const { migrateInternal } = await import('./migrate_data.js');
          await migrateInternal();
          console.log('✅ Migração automática concluída.');
        } catch (migErr) {
          console.error('⚠️ Erro na migração automática:', migErr.message);
        }
      }
    });

  } catch (err) {
    console.error('❌ Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

startServer();
