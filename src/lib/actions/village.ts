'use server'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { STARTER_CREDITS } from '@/types/database'

async function getFamilyId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return family?.id || null
}

export async function createVillage(formData: FormData) {
  const supabase = await createClient()
  const familyId = await getFamilyId()
  if (!familyId) redirect('/auth/login')

  const name = formData.get('name') as string
  const zipCode = formData.get('zip_code') as string
  const description = formData.get('description') as string || null
  const maxFamilies = parseInt(formData.get('max_families') as string) || 8

  // Create village
  const { data: village, error } = await supabase
    .from('villages')
    .insert({
      name,
      zip_code: zipCode,
      description,
      max_families: maxFamilies,
      owner_family_id: familyId,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Add creator as owner member
  const { error: memberError } = await supabase
    .from('village_members')
    .insert({
      village_id: village.id,
      family_id: familyId,
      role: 'owner',
    })

  if (memberError) {
    return { error: memberError.message }
  }

  // Grant starter credits using service client
  const serviceClient = await createServiceClient()
  await serviceClient.rpc('add_credit_entry', {
    p_family_id: familyId,
    p_amount: STARTER_CREDITS,
    p_event_type: 'starter_credit',
    p_description: `Welcome to ${name}! Here are your starter credits.`,
  })

  redirect('/dashboard')
}

export async function joinVillage(formData: FormData) {
  const supabase = await createClient()
  const familyId = await getFamilyId()
  if (!familyId) redirect('/auth/login')

  const inviteCode = (formData.get('invite_code') as string).trim().toLowerCase()

  // Find village by invite code
  const { data: village, error: villageError } = await supabase
    .from('villages')
    .select('*, village_members(count)')
    .eq('invite_code', inviteCode)
    .single()

  if (villageError || !village) {
    return { error: 'Invalid invite code. Please check and try again.' }
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('village_members')
    .select('id')
    .eq('village_id', village.id)
    .eq('family_id', familyId)
    .single()

  if (existing) {
    return { error: 'You are already a member of this village.' }
  }

  // Check capacity
  const { count } = await supabase
    .from('village_members')
    .select('*', { count: 'exact', head: true })
    .eq('village_id', village.id)

  if (count && count >= village.max_families) {
    return { error: 'This village is full.' }
  }

  // Join village
  const { error: joinError } = await supabase
    .from('village_members')
    .insert({
      village_id: village.id,
      family_id: familyId,
      role: 'member',
    })

  if (joinError) {
    return { error: joinError.message }
  }

  // Grant starter credits
  const serviceClient = await createServiceClient()
  await serviceClient.rpc('add_credit_entry', {
    p_family_id: familyId,
    p_amount: STARTER_CREDITS,
    p_event_type: 'starter_credit',
    p_description: `Welcome to ${village.name}! Here are your starter credits.`,
  })

  redirect('/dashboard')
}
