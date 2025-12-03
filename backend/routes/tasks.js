import { Router } from 'express';
import pool from '../src/config/db.js'; // ajuste se seu arquivo de conexão estiver em outro path
import redis from '../redis.js';

const router = Router();

// GET /tasks — com CACHE
router.get('/', async (req, res) => {
  const cacheKey = 'tasks:all';

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log('CACHE HIT →', cacheKey);
      return res.json(JSON.parse(cached));
    }

    console.log('CACHE MISS →', cacheKey);

    const { rows: tasks } = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );

    await redis.set(cacheKey, JSON.stringify(tasks), 'EX', 15);

    return res.json(tasks);

  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

// POST /tasks — invalida cache
router.post('/', async (req, res) => {
  const { title, description } = req.body;

  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );

    await redis.del('tasks:all');
    console.log('Cache invalidado (CREATE)');

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

// PUT /tasks/:id — invalida cache
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE tasks SET title=$1, description=$2 WHERE id=$3 RETURNING *',
      [title, description, id]
    );

    await redis.del('tasks:all');
    console.log('Cache invalidado (UPDATE)');

    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

// DELETE /tasks/:id — invalida cache
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [id]);

    await redis.del('tasks:all');
    console.log('Cache invalidado (DELETE)');

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

export default router;
