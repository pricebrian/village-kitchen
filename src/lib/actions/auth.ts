'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/onboarding/profile')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if they have a family profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication failed' }

  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!family) {
    redirect('/onboarding/profile')
  }

  // Check if they have liability acknowledgements
  const { data: liability } = await supabase
    .from('liability_acknowledgements')
    .select('*')
    .eq('family_id', family.id)
    .single()

  if (!liability || !liability.cooking_acknowledged || !liability.receiving_acknowledged) {
    redirect('/onboarding/liability')
  }

  // Check if they're in a village
  const { data: membership } = await supabase
    .from('village_members')
    .select('id')
    .eq('family_id', family.id)
    .limit(1)
    .single()

  if (!membership) {
    redirect('/onboarding/village')
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
