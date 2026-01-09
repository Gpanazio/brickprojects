import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração do pool de conexões com o PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Função para testar a conexão
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');
    client.release();
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
    await client.query('BEGIN');
    
    
    // Tabela de projetos
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
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
        monolith_image VARCHAR(500),
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
      CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(display_order);
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
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
      CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    
    // Trigger para master_users
    await client.query(`
      DROP TRIGGER IF EXISTS update_master_users_updated_at ON master_users;
      CREATE TRIGGER update_master_users_updated_at
      BEFORE UPDATE ON master_users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await client.query('COMMIT');
    console.log('✅ Tabelas inicializadas com sucesso');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao inicializar tabelas:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Exporta o pool para uso nas rotas
export default pool;
