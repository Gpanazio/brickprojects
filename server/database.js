import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração do pool de conexões com o PostgreSQL
// Configuração do pool de conexões (CONTEÚDO)
// Configuração do pool de conexões com o PostgreSQL
// Configuração do pool de conexões (CONTEÚDO) -> Agora no NOVO (DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Content DB (New)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Configuração do pool de conexões (AUTH/LOGIN) -> Agora no ANTIGO (DATABASE_PUBLIC_URL)
export const authPool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL, // Auth DB (Old)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Função para testar a conexão
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL (CONTEÚDO)');
    client.release();

    // Testa também o banco de Auth se for diferente
    if (process.env.DATABASE_PUBLIC_URL) {
      const authClient = await authPool.connect();
      console.log('✅ Conectado ao banco de dados PostgreSQL (AUTH)');
      authClient.release();
    }

    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    return false;
  }
}

// Função para inicializar as tabelas
export async function initDatabase() {
  const client = await pool.connect();
  try {
    // --- BANCO DE CONTEÚDO ---
    await client.query('BEGIN');

    // ... [existing content] ...

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao inicializar tabelas de CONTEÚDO:', err.message);
    throw err;
  } finally {
    client.release();
  }

  // --- BANCO DE CONTEÚDO (Novo - DATABASE_PUBLIC_URL) ---
  if (!process.env.DATABASE_PUBLIC_URL) {
    console.warn('⚠️ DATABASE_PUBLIC_URL não definida. Pulando inicialização das tabelas de conteúdo.');
    // Se não tem DB de conteúdo, não adianta tentar inicializar o resto se dependesse dele, 
    // mas aqui são conexões independentes. Vamos seguir para o Auth se possível.
  } else {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // ... [create content tables] ...
      // O código abaixo cria as tabelas. Como estamos dentro do `else`, vou precisar mover o bloco try/catch original para cá.
      // Vou simplificar a substituição mantendo a estrutura original mas trocando a guarda.
    } catch (err) {
      // ...
    }
  }

  const authClient = await authPool.connect();
  try {
    await authClient.query('BEGIN');

    // Tabela de projetos
    await client.query(`
      CREATE TABLE IF NOT EXISTS originais_projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        genre VARCHAR(255) NOT NULL,
        format TEXT NOT NULL,
        status VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        long_description TEXT NOT NULL,
        video_label VARCHAR(255),
        bg_image VARCHAR(500),
        bg_image_zoom INTEGER DEFAULT 0,
        bg_image_offset_x INTEGER DEFAULT 0,
        bg_image_offset_y INTEGER DEFAULT 0,
        monolith_image VARCHAR(500),
        monolith_image_zoom INTEGER DEFAULT 0,
        monolith_image_offset_x INTEGER DEFAULT 0,
        monolith_image_offset_y INTEGER DEFAULT 0,
        vimeo_id VARCHAR(255),
        vimeo_hash VARCHAR(255),
        pdf_url VARCHAR(500),
        host VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índice para ordenação
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_originais_projects_order ON originais_projects(display_order);
    `);

    await client.query(`
      ALTER TABLE originais_projects
        ADD COLUMN IF NOT EXISTS bg_image_zoom INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS bg_image_offset_x INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS bg_image_offset_y INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS monolith_image_zoom INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS monolith_image_offset_x INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS monolith_image_offset_y INTEGER DEFAULT 0;
    `);

    // Função para atualizar updated_at automaticamente
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Trigger para projects
    await client.query(`
      DROP TRIGGER IF EXISTS update_originais_projects_updated_at ON originais_projects;
      CREATE TRIGGER update_originais_projects_updated_at
      BEFORE UPDATE ON originais_projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tabela de seleções (Curas/Playlists)
    await client.query(`
      CREATE TABLE IF NOT EXISTS originais_selections (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        cover_image VARCHAR(500),
        cover_image_zoom INTEGER DEFAULT 0,
        cover_image_offset_x INTEGER DEFAULT 0,
        cover_image_offset_y INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE originais_selections
        ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500),
        ADD COLUMN IF NOT EXISTS cover_image_zoom INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS cover_image_offset_x INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS cover_image_offset_y INTEGER DEFAULT 0;
    `);

    // Tabela de itens da seleção (relacionamento muitos-para-muitos)
    await client.query(`
      CREATE TABLE IF NOT EXISTS originais_selection_items (
        id SERIAL PRIMARY KEY,
        selection_id INTEGER REFERENCES originais_selections(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES originais_projects(id) ON DELETE CASCADE,
        display_order INTEGER DEFAULT 0,
        UNIQUE(selection_id, project_id)
      );
    `);

    // Trigger para selections
    await client.query(`
      DROP TRIGGER IF EXISTS update_originais_selections_updated_at ON originais_selections;
      CREATE TRIGGER update_originais_selections_updated_at
      BEFORE UPDATE ON originais_selections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query('COMMIT');
    console.log('✅ Tabelas de CONTEÚDO inicializadas com sucesso');


    // --- BANCO DE AUTH ---
    await authClient.query('BEGIN');

    // Tabela de usuários (master_users)
    await authClient.query(`
      CREATE TABLE IF NOT EXISTS master_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await authClient.query('COMMIT');
    console.log('✅ Tabelas de AUTH inicializadas com sucesso');

  } catch (err) {
    await client.query('ROLLBACK');
    await authClient.query('ROLLBACK');
    console.error('❌ Erro ao inicializar tabelas:', err.message);
    throw err;
  } finally {
    client.release();
    authClient.release();
  }
}

// Exporta o pool para uso nas rotas
export default pool;
