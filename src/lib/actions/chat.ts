'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!family) return { error: 'Family not found' }

  const { data: membership } = await supabase
    .from('village_members')
    .select('village_id')
    .eq('family_id', family.id)
    .limit(1)
    .single()

  if (!membership) return { error: 'Not in a village' }

  const message = (formData.get('message') as string)?.trim()
  if (!message) return { error: 'Message is empty' }

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      village_id: membership.village_id,
      family_id: family.id,
      message,
    })

  if (error) return { error: error.message }
  return { success: true }
}
