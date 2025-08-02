import { createClient } from '@supabase/supabase-js'

// This client is for client-side usage only
const supabaseUrl = 'https://izahxmtcripexpgtaxdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6YWh4bXRjcmlwZXhwZ3RheGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk0MjYyMjIsImV4cCI6MjAzNTAwMjIyMn0.5V-g7IR_hVSwY1W451hPBA_oo86FW1bbfy4lt2pIYqY'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or anonymous key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
