// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vwfjuypesbnnezdpfsul.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Zmp1eXBlc2JubmV6ZHBmc3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDIwODEsImV4cCI6MjA2NzMxODA4MX0.oVWeCZI_Pzyya628lnA6FX_gwa2M95O7gPQiTaCnMSc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});