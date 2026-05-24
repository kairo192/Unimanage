import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://eljyjujwwvlzupvloeki.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.warn(
    '⚠ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY not set. ' +
    'File uploads will use local filesystem. ' +
    'Set these in .env for cloud storage.'
  );
}

const supabase = supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

export default supabase;
