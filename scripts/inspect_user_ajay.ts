const SUPABASE_URL = 'https://durcfljdheewazrlevip.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cmNmbGpkaGVld2F6cmxldmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzYwNjMsImV4cCI6MjA5ODgxMjA2M30.tLUHIO8SU5grUcdLPu8badcY_np0RIXnMjmBZwAj9Dg'

async function main() {
  console.log('Fetching users via Supabase REST API...')
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  })

  if (!res.ok) {
    console.error('Error:', res.status, res.statusText, await res.text())
    return
  }

  const users = await res.json()
  console.log(`\nTotal users in public.users: ${users.length}\n`)
  console.log('ALL USERS:')
  console.table(users.map((u: any) => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    approval_status: u.approval_status,
    plant_id: u.plant_id
  })))

  const ajayUsers = users.filter((u: any) =>
    (u.email && u.email.toLowerCase().includes('ajay')) ||
    (u.full_name && u.full_name.toLowerCase().includes('ajay'))
  )

  console.log('\n--- AJAY DETAILS ---')
  console.log(JSON.stringify(ajayUsers, null, 2))
}

main()
