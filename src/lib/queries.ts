import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return user
}

export async function getFamily() {
  const supabase = await createClient()
  const user = await getAuthUser()
  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return family
}

export async function requireFamily() {
  const family = await getFamily()
  if (!family) redirect('/onboarding/profile')
  return family
}

export async function getVillageMembership(familyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('village_members')
    .select('*, village:villages(*)')
    .eq('family_id', familyId)
    .limit(1)
    .single()
  return data
}

export async function requireVillage(familyId: string) {
  const membership = await getVillageMembership(familyId)
  if (!membership) redirect('/onboarding/village')
  return membership
}

export async function getVillageMembers(villageId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('village_members')
    .select('*, family:families(*)')
    .eq('village_id', villageId)
    .order('joined_at')
  return data || []
}

export async function getUpcomingMeals(villageId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('meals')
    .select('*, cook_family:families(*)')
    .eq('village_id', villageId)
    .eq('status', 'active')
    .gte('meal_date', today)
    .order('meal_date')
    .order('pickup_start_time')
  return data || []
}

export async function getMeal(mealId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('meals')
    .select('*, cook_family:families(*)')
    .eq('id', mealId)
    .single()
  return data
}

export async function getMealReservations(mealId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reservations')
    .select('*, family:families(*)')
    .eq('meal_id', mealId)
    .neq('status', 'canceled')
    .order('created_at')
  return data || []
}

export async function getMyReservations(familyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reservations')
    .select('*, meal:meals(*, cook_family:families(*))')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getCreditBalance(familyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('credit_ledger')
    .select('balance_after')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data?.balance_after ?? 0
}

export async function getCreditLedger(familyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('credit_ledger')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getChatMessages(villageId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('chat_messages')
    .select('*, family:families(*)')
    .eq('village_id', villageId)
    .order('created_at', { ascending: true })
    .limit(100)
  return data || []
}

export async function getNotifications(familyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(20)
  return data || []
}

export async function getUnreadNotificationCount(familyId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .eq('read', false)
  return count || 0
}

export async function getFeedbackForCook(familyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('feedback')
    .select('*, from_family:families!feedback_from_family_id_fkey(*), meal:meals(*)')
    .eq('to_family_id', familyId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getLiabilityAcknowledgement(familyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('liability_acknowledgements')
    .select('*')
    .eq('family_id', familyId)
    .single()
  return data
}
