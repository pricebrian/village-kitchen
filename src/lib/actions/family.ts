'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createFamilyProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const familyName = formData.get('family_name') as string
  const adultsCount = parseInt(formData.get('adults_count') as string) || 2
  const kidsCount = parseInt(formData.get('kids_count') as string) || 0
  const kidsAges = formData.get('kids_ages') as string || null
  const allergies = formData.getAll('allergies') as string[]
  const dietaryRestrictions = formData.getAll('dietary_restrictions') as string[]
  const preferences = formData.get('preferences') as string || null
  const pickyEaterLevel = formData.get('picky_eater_level') as string || 'medium'
  const notes = formData.get('notes') as string || null

  const { error } = await supabase
    .from('families')
    .upsert({
      user_id: user.id,
      family_name: familyName,
      adults_count: adultsCount,
      kids_count: kidsCount,
      kids_ages: kidsAges,
      allergies,
      dietary_restrictions: dietaryRestrictions,
      preferences,
      picky_eater_level: pickyEaterLevel,
      notes,
    }, { onConflict: 'user_id' })

  if (error) {
    return { error: error.message }
  }

  redirect('/onboarding/liability')
}

export async function updateFamilyProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const familyName = formData.get('family_name') as string
  const adultsCount = parseInt(formData.get('adults_count') as string) || 2
  const kidsCount = parseInt(formData.get('kids_count') as string) || 0
  const kidsAges = formData.get('kids_ages') as string || null
  const allergies = formData.getAll('allergies') as string[]
  const dietaryRestrictions = formData.getAll('dietary_restrictions') as string[]
  const preferences = formData.get('preferences') as string || null
  const pickyEaterLevel = formData.get('picky_eater_level') as string || 'medium'
  const notes = formData.get('notes') as string || null

  const { error } = await supabase
    .from('families')
    .update({
      family_name: familyName,
      adults_count: adultsCount,
      kids_count: kidsCount,
      kids_ages: kidsAges,
      allergies,
      dietary_restrictions: dietaryRestrictions,
      preferences,
      picky_eater_level: pickyEaterLevel,
      notes,
    })
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
