import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://durcfljdheewazrlevip.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cmNmbGpkaGVld2F6cmxldmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzYwNjMsImV4cCI6MjA5ODgxMjA2M30.tLUHIO8SU5grUcdLPu8badcY_np0RIXnMjmBZwAj9Dg');
async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { query: "SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'sync_user_app_metadata';" });
  console.log('Result:', data, error);
}
run();
