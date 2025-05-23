
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qlvigbikaouhpnstuuxc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdmlnYmlrYW91aHBuc3R1dXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDk2NTQsImV4cCI6MjA2MTUyNTY1NH0.o-7BI7bgIUXlnWG9AqhqR4qy-a9w9JVUk3TwZ2XK7ac";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

