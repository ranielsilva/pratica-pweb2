import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validação para garantir que as variáveis de ambiente foram carregadas
if (!supabaseUrl || !supabaseKey) {
  throw new Error('As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias.');
}

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);