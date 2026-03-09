'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function acknowledgeLiability(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!family) redirect('/onboarding/profile')

  const cookingAcknowledged = formData.get('cooking_acknowledged') === 'on'
  const receivingAcknowledged = formData.get('receiving_acknowledged') === 'on'

  if (!cookingAcknowledged || !receivingAcknowledged) {
    return { error: 'You must accept both acknowledgements to continue.' }
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('liability_acknowledgements')
    .upsert({
      family_id: family.id,
      cooking_acknowledged: true,
      cooking_acknowledged_at: now,
      receiving_acknowledged: true,
      receiving_acknowledged_at: now,
    }, { onConflict: 'family_id' })

  if (error) {
    return { error: error.message }
  }

  redirect('/onboarding/village')
}
