'use server'

import { createClient } from '@/lib/supabase/server'

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!family) return

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('family_id', family.id)
    .eq('read', false)
}
