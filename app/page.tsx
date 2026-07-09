import { createClient } from '@/lib/supabase/server'
import SignUpForm from '@/app/signup-form'

export default async function HomeSignUpPage() {
  const supabase = await createClient()

  const { data: plants, error } = await supabase
    .from('plants_public')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Failed to load plants for signup form:', error)
  }

  return <SignUpForm plants={plants ?? []} />
}