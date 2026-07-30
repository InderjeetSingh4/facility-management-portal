import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://durcfljdheewazrlevip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cmNmbGpkaGVld2F6cmxldmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzYwNjMsImV4cCI6MjA5ODgxMjA2M30.tLUHIO8SU5grUcdLPu8badcY_np0RIXnMjmBZwAj9Dg'
);

async function run() {
  console.log('Fetching plants_public...');
  const { data, error } = await supabase.from('plants_public').select('id, name').order('name');
  console.log('Result data:', data);
  console.log('Result error:', error);
}

run();
