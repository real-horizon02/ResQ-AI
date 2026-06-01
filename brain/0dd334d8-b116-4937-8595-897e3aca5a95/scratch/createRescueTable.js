import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Need service role key to execute raw SQL or use RPC, or we can just use the REST API if we have migration privileges.
// Actually, with Supabase, we can't create tables easily from client without Postgres functions.
