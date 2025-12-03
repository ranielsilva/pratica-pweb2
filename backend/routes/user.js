import { Router } from 'express';
import multer from 'multer';
import supabase from '../supabase.js';
import pool from '../src/config/db.js';
import path from 'path';

const router = Router();

// Multer em memória
const upload = multer({ storage: multer.memoryStorage() });

router.put('/profile/:id', upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const file = req.file;

  try {
    const result = await pool.query(
      'SELECT avatar_url FROM users WHERE id=$1',
      [id]
    );

    let avatarUrl = result.rows[0]?.avatar_url;

    // Se foi enviado um arquivo, envia para Supabase
    if (file) {
      const fileExt = path.extname(file.originalname);
      const fileName = `avatar_${id}${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      avatarUrl = data.publicUrl;
    }

    const { rows } = await pool.query(
      'UPDATE users SET name=$1, email=$2, avatar_url=$3 WHERE id=$4 RETURNING *',
      [name, email, avatarUrl, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Erro ao atualizar perfil',
      details: error.message
    });
  }
});

export default router;
