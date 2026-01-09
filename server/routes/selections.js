import express from 'express';
import pool from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET: Listar todas as seleções
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM originais_selections ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar seleções:', err);
    res.status(500).json({ error: 'Erro ao buscar seleções' });
  }
});

// GET: Buscar uma seleção específica pelo SLUG (público)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Busca a seleção
    const selectionResult = await pool.query(
      'SELECT * FROM originais_selections WHERE slug = $1',
      [slug]
    );

    if (selectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Seleção não encontrada' });
    }

    const selection = selectionResult.rows[0];

    // Busca os projetos associados a esta seleção
    const projectsResult = await pool.query(
      `SELECT p.* FROM originais_projects p
       JOIN originais_selection_items si ON p.id = si.project_id
       WHERE si.selection_id = $1
       ORDER BY si.display_order ASC`,
      [selection.id]
    );

    res.json({
      ...selection,
      projects: projectsResult.rows
    });

  } catch (err) {
    console.error('Erro ao buscar seleção por slug:', err);
    res.status(500).json({ error: 'Erro ao buscar seleção' });
  }
});

// POST: Criar nova seleção (protegido)
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, slug, description, projectIds } = req.body;

    if (!name || !slug || !Array.isArray(projectIds)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    await client.query('BEGIN');

    // Cria a seleção
    const selectionResult = await client.query(
      'INSERT INTO originais_selections (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description]
    );

    const selection = selectionResult.rows[0];

    // Associa os projetos
    for (let i = 0; i < projectIds.length; i++) {
      await client.query(
        'INSERT INTO originais_selection_items (selection_id, project_id, display_order) VALUES ($1, $2, $3)',
        [selection.id, projectIds[i], i]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(selection);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar seleção:', err);
    res.status(500).json({ error: 'Erro ao criar seleção' });
  } finally {
    client.release();
  }
});

// DELETE: Deletar seleção (protegido)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM originais_selections WHERE id = $1', [id]);
    res.json({ message: 'Seleção deletada com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar seleção:', err);
    res.status(500).json({ error: 'Erro ao deletar seleção' });
  }
});

export default router;
