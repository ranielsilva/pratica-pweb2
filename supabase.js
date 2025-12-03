import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || supabaseUrl.trim() === '' || !supabaseKey || supabaseKey.trim() === '') {
  throw new Error('Variáveis de ambiente do Supabase (SUPABASE_URL, SUPABASE_KEY) não estão definidas.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;