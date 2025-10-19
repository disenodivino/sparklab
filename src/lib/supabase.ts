import { createClient } from '@supabase/supabase-js'

// This client is for client-side usage only
const supabaseUrl = 'https://wawqvwyaijzcoynpxsvj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhd3F2d3lhaWp6Y295bnB4c3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTIzMTMsImV4cCI6MjA3NjI2ODMxM30.qxZC5V6izAjl0cvyoJP6hsj_euQ1By5Ko4kLirE8L0I'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or anonymous key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
