import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://drposbmbmhxjhuiztswx.supabase.co';
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_gpOaDJYLTnd7GuUJCSvcPw_dlgU_WHZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
