import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aihftgukvvhkshglsndd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpaGZ0Z3VrdnZoa3NoZ2xzbmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NjUzNTEsImV4cCI6MjA1MzE0MTM1MX0.8UiRLm30m1g4dN6D-cY2C8dg4Two4fZxrjn9JJ1n_Xs';

export const supabase = createClient(supabaseUrl, supabaseKey); 