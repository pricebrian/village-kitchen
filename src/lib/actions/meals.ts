'use server'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function getFamily() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return family
}

async function getVillageMembership(familyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('village_members')
    .select('village_id')
    .eq('family_id', familyId)
    .limit(1)
    .single()
  return data
}

export async function createMeal(formData: FormData) {
  const supabase = await createClient()
  const family = await getFamily()
  if (!family) redirect('/auth/login')

  const membership = await getVillageMembership(family.id)
  if (!membership) redirect('/onboarding/village')

  const mealName = formData.get('meal_name') as string
  const shortDescription = formData.get('short_description') as string || null
  const mealDate = formData.get('meal_date') as string
  const pickupStartTime = formData.get('pickup_start_time') as string
  const pickupEndTime = formData.get('pickup_end_time') as string
  const totalPortions = parseInt(formData.get('total_portions') as string)
  const ingredientsSummary = formData.get('ingredients_summary') as string || null
  const allergenFlags = formData.getAll('allergen_flags') as string[]
  const notes = formData.get('notes') as string || null

  // Build full datetime from date + time
  const pickupStart = new Date(`${mealDate}T${pickupStartTime}`)
  const pickupEnd = new Date(`${mealDate}T${pickupEndTime}`)

  // Validate 24 hours in advance
  const now = new Date()
  const minTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  if (pickupStart < minTime) {
    return { error: 'Meals must be posted at least 24 hours before pickup time.' }
  }

  if (pickupEnd <= pickupStart) {
    return { error: 'Pickup end time must be after start time.' }
  }

  if (totalPortions < 1) {
    return { error: 'Must offer at least 1 portion.' }
  }

  const { error } = await supabase
    .from('meals')
    .insert({
      village_id: membership.village_id,
      cook_family_id: family.id,
      meal_name: mealName,
      short_description: shortDescription,
      meal_date: mealDate,
      pickup_start_time: pickupStart.toISOString(),
      pickup_end_time: pickupEnd.toISOString(),
      total_portions: totalPortions,
      ingredients_summary: ingredientsSummary,
      allergen_flags: allergenFlags,
      notes,
    })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function cancelMeal(mealId: string) {
  const supabase = await createClient()
  const family = await getFamily()
  if (!family) return { error: 'Not authenticated' }

  // Verify ownership
  const { data: meal } = await supabase
    .from('meals')
    .select('*')
    .eq('id', mealId)
    .eq('cook_family_id', family.id)
    .single()

  if (!meal) return { error: 'Meal not found or not authorized' }

  // Cancel the meal
  const { error } = await supabase
    .from('meals')
    .update({ status: 'canceled' })
    .eq('id', mealId)

  if (error) return { error: error.message }

  // Refund all active reservations
  const { data: reservations } = await supabase
    .from('reservations')
    .select('*')
    .eq('meal_id', mealId)
    .eq('status', 'reserved')

  if (reservations && reservations.length > 0) {
    const serviceClient = await createServiceClient()
    for (const reservation of reservations) {
      // Cancel reservation
      await supabase
        .from('reservations')
        .update({ status: 'canceled', canceled_at: new Date().toISOString() })
        .eq('id', reservation.id)

      // Refund credits
      await serviceClient.rpc('add_credit_entry', {
        p_family_id: reservation.family_id,
        p_amount: reservation.portion_count,
        p_event_type: 'meal_canceled_refund',
        p_reference_id: reservation.id,
        p_description: `Refund: ${meal.meal_name} was canceled by the cook.`,
      })

      // Notify the family
      await serviceClient
        .from('notifications')
        .insert({
          family_id: reservation.family_id,
          type: 'meal_canceled',
          title: 'Meal canceled',
          body: `${meal.meal_name} has been canceled. Your ${reservation.portion_count} credit(s) have been refunded.`,
          reference_id: mealId,
        })
    }
  }

  redirect('/dashboard')
}

export async function reserveMeal(formData: FormData) {
  const supabase = await createClient()
  const family = await getFamily()
  if (!family) return { error: 'Not authenticated' }

  const mealId = formData.get('meal_id') as string
  const portionCount = parseInt(formData.get('portion_count') as string)

  if (portionCount < 1) return { error: 'Must reserve at least 1 portion.' }

  // Get meal details
  const { data: meal } = await supabase
    .from('meals')
    .select('*')
    .eq('id', mealId)
    .single()

  if (!meal) return { error: 'Meal not found.' }
  if (meal.status !== 'active') return { error: 'This meal is no longer available.' }
  if (meal.cook_family_id === family.id) return { error: "You can't reserve your own meal." }

  // Check available portions
  const available = meal.total_portions - meal.reserved_portions
  if (portionCount > available) {
    return { error: `Only ${available} portion(s) remaining.` }
  }

  // Check credit balance
  const serviceClient = await createServiceClient()
  const { data: balance } = await serviceClient.rpc('get_credit_balance', {
    p_family_id: family.id,
  })

  if ((balance ?? 0) < portionCount) {
    return { error: `Insufficient credits. You have ${balance ?? 0} credit(s).` }
  }

  // Deduct credits
  await serviceClient.rpc('add_credit_entry', {
    p_family_id: family.id,
    p_amount: -portionCount,
    p_event_type: 'reservation_deduction',
    p_reference_id: mealId,
    p_description: `Reserved ${portionCount} portion(s) of ${meal.meal_name}`,
  })

  // Get village membership
  const membership = await getVillageMembership(family.id)

  // Create reservation
  const { error } = await supabase
    .from('reservations')
    .insert({
      meal_id: mealId,
      family_id: family.id,
      village_id: membership!.village_id,
      portion_count: portionCount,
    })

  if (error) {
    // Refund credits if reservation fails
    await serviceClient.rpc('add_credit_entry', {
      p_family_id: family.id,
      p_amount: portionCount,
      p_event_type: 'reservation_canceled_refund',
      p_reference_id: mealId,
      p_description: `Refund: reservation failed for ${meal.meal_name}`,
    })
    return { error: error.message }
  }

  // Update reserved portions count on meal
  await supabase
    .from('meals')
    .update({ reserved_portions: meal.reserved_portions + portionCount })
    .eq('id', mealId)

  // Notify cook
  await serviceClient
    .from('notifications')
    .insert({
      family_id: meal.cook_family_id,
      type: 'new_reservation',
      title: 'New reservation',
      body: `Someone reserved ${portionCount} portion(s) of your ${meal.meal_name}.`,
      reference_id: mealId,
    })

  redirect('/reservations')
}

export async function cancelReservation(reservationId: string) {
  const supabase = await createClient()
  const family = await getFamily()
  if (!family) return { error: 'Not authenticated' }

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*, meal:meals(*)')
    .eq('id', reservationId)
    .eq('family_id', family.id)
    .eq('status', 'reserved')
    .single()

  if (!reservation) return { error: 'Reservation not found.' }

  // Cancel and refund
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'canceled', canceled_at: new Date().toISOString() })
    .eq('id', reservationId)

  if (error) return { error: error.message }

  // Refund credits
  const serviceClient = await createServiceClient()
  await serviceClient.rpc('add_credit_entry', {
    p_family_id: family.id,
    p_amount: reservation.portion_count,
    p_event_type: 'reservation_canceled_refund',
    p_reference_id: reservationId,
    p_description: `Canceled reservation for ${reservation.meal?.meal_name}`,
  })

  // Update meal reserved count
  await supabase
    .from('meals')
    .update({
      reserved_portions: Math.max(0, (reservation.meal?.reserved_portions || 0) - reservation.portion_count)
    })
    .eq('id', reservation.meal_id)

  redirect('/reservations')
}

export async function confirmReceipt(formData: FormData) {
  const supabase = await createClient()
  const family = await getFamily()
  if (!family) return { error: 'Not authenticated' }

  const reservationId = formData.get('reservation_id') as string
  const sentiment = formData.get('sentiment') as string
  const tags = formData.getAll('tags') as string[]
  const notes = formData.get('notes') as string || null

  // Get reservation
  const { data: reservation } = await supabase
    .from('reservations')
    .select('*, meal:meals(*)')
    .eq('id', reservationId)
    .eq('family_id', family.id)
    .eq('status', 'reserved')
    .single()

  if (!reservation) return { error: 'Reservation not found or already confirmed.' }

  // Mark as confirmed
  const { error: confirmError } = await supabase
    .from('reservations')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', reservationId)

  if (confirmError) return { error: confirmError.message }

  // Credit the cook
  const serviceClient = await createServiceClient()
  await serviceClient.rpc('add_credit_entry', {
    p_family_id: reservation.meal.cook_family_id,
    p_amount: reservation.portion_count,
    p_event_type: 'meal_cooked_earn',
    p_reference_id: reservation.meal_id,
    p_description: `Earned ${reservation.portion_count} credit(s) for ${reservation.meal.meal_name}`,
  })

  // Save feedback if provided
  if (sentiment) {
    await supabase
      .from('feedback')
      .insert({
        reservation_id: reservationId,
        meal_id: reservation.meal_id,
        from_family_id: family.id,
        to_family_id: reservation.meal.cook_family_id,
        sentiment,
        tags,
        notes,
      })
  }

  // Notify cook
  await serviceClient
    .from('notifications')
    .insert({
      family_id: reservation.meal.cook_family_id,
      type: 'receipt_confirmed',
      title: 'Meal received!',
      body: `Someone confirmed receiving ${reservation.portion_count} portion(s) of your ${reservation.meal.meal_name}. You earned ${reservation.portion_count} credit(s)!`,
      reference_id: reservation.meal_id,
    })

  redirect('/reservations')
}
