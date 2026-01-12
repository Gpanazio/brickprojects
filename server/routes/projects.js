gimport express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET: Listar todos os projetos (público)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM originais_projects ORDER BY display_order ASC, id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar projetos:', err);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
});

// GET: Buscar projeto por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM originais_projects WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar projeto:', err);
    res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
});

// POST: Criar novo projeto (protegido)
router.post('/', authenticateToken, [
  body('title').trim().notEmpty().withMessage('Título é obrigatório'),
  body('category').trim().notEmpty().withMessage('Categoria é obrigatória'),
  body('genre').trim().notEmpty().withMessage('Gênero é obrigatório'),
  body('format').trim().notEmpty().withMessage('Formato é obrigatório'),
  body('status').trim().notEmpty().withMessage('Status é obrigatório'),
  body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
  body('long_description').trim().notEmpty().withMessage('Descrição longa é obrigatória')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      category,
      genre,
      format,
      status,
      description,
      long_description,
      video_label,
      bg_image,
      bg_image_zoom = 0,
      bg_image_offset_x = 0,
      bg_image_offset_y = 0,
      monolith_image,
      monolith_image_zoom = 0,
      monolith_image_offset_x = 0,
      monolith_image_offset_y = 0,
      vimeo_id,
      vimeo_hash,
      pdf_url,
      host,
      display_order = 0
    } = req.body;

    const result = await pool.query(
      `INSERT INTO originais_projects 
        (title, category, genre, format, status, description, long_description, 
         video_label, bg_image, bg_image_zoom, bg_image_offset_x, bg_image_offset_y,
         monolith_image, monolith_image_zoom, monolith_image_offset_x, monolith_image_offset_y,
         vimeo_id, vimeo_hash, pdf_url, host, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [title, category, genre, format, status, description, long_description,
       video_label, bg_image, bg_image_zoom, bg_image_offset_x, bg_image_offset_y,
       monolith_image, monolith_image_zoom, monolith_image_offset_x, monolith_image_offset_y,
       vimeo_id, vimeo_hash, pdf_url, host, display_order]
    );

    res.status(201).json({
      message: 'Projeto criado com sucesso',
      project: result.rows[0]
    });

  } catch (err) {
    console.error('Erro ao criar projeto:', err);
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
});

// PUT: Atualizar projeto (protegido)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      genre,
      format,
      status,
      description,
      long_description,
      video_label,
      bg_image,
      bg_image_zoom = 0,
      bg_image_offset_x = 0,
      bg_image_offset_y = 0,
      monolith_image,
      monolith_image_zoom = 0,
      monolith_image_offset_x = 0,
      monolith_image_offset_y = 0,
      vimeo_id,
      vimeo_hash,
      pdf_url,
      host,
      display_order
    } = req.body;

    // Verifica se o projeto existe
    const checkProject = await pool.query(
      'SELECT * FROM originais_projects WHERE id = $1',
      [id]
    );

    if (checkProject.rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    const result = await pool.query(
      `UPDATE originais_projects 
       SET title = $1, category = $2, genre = $3, format = $4, status = $5,
           description = $6, long_description = $7, video_label = $8,
           bg_image = $9, bg_image_zoom = $10, bg_image_offset_x = $11, bg_image_offset_y = $12,
           monolith_image = $13, monolith_image_zoom = $14, monolith_image_offset_x = $15, monolith_image_offset_y = $16,
           vimeo_id = $17, vimeo_hash = $18, pdf_url = $19, host = $20, display_order = $21
       WHERE id = $22
       RETURNING *`,
      [title, category, genre, format, status, description, long_description,
       video_label, bg_image, bg_image_zoom, bg_image_offset_x, bg_image_offset_y,
       monolith_image, monolith_image_zoom, monolith_image_offset_x, monolith_image_offset_y,
       vimeo_id, vimeo_hash, pdf_url, host, display_order, id]
    );

    res.json({
      message: 'Projeto atualizado com sucesso',
      project: result.rows[0]
    });

  } catch (err) {
    console.error('Erro ao atualizar projeto:', err);
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
});

// DELETE: Deletar projeto (protegido)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM originais_projects WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json({
      message: 'Projeto deletado com sucesso',
      project: result.rows[0]
    });

  } catch (err) {
    console.error('Erro ao deletar projeto:', err);
    res.status(500).json({ error: 'Erro ao deletar projeto' });
  }
});

// PATCH: Atualizar ordem de exibição (protegido)
router.patch('/reorder', authenticateToken, async (req, res) => {
  try {
    const { projects } = req.body; // Array de { id, display_order }

    if (!Array.isArray(projects)) {
      return res.status(400).json({ error: 'Formato inválido' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      for (const project of projects) {
        await client.query(
          'UPDATE originais_projects SET display_order = $1 WHERE id = $2',
          [project.display_order, project.id]
        );
      }

      await client.query('COMMIT');
      
      res.json({ message: 'Ordem atualizada com sucesso' });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('Erro ao reordenar projetos:', err);
    res.status(500).json({ error: 'Erro ao reordenar projetos' });
  }
});

export default router;
