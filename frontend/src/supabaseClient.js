import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

// null when the .env variables are missing, so the app can fall back to sample data
// instead of crashing (createClient throws on an undefined URL).
export const supabase = url && key ? createClient(url, key) : null;
