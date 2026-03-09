export type Family = {
  id: string
  user_id: string
  family_name: string
  adults_count: number
  kids_count: number
  kids_ages: string | null
  allergies: string[]
  dietary_restrictions: string[]
  preferences: string | null
  picky_eater_level: 'low' | 'medium' | 'high'
  notes: string | null
  created_at: string
  updated_at: string
}

export type Village = {
  id: string
  name: string
  zip_code: string
  description: string | null
  max_families: number
  invite_code: string
  owner_family_id: string | null
  created_at: string
  updated_at: string
}

export type VillageMember = {
  id: string
  village_id: string
  family_id: string
  role: 'owner' | 'member'
  joined_at: string
}

export type LiabilityAcknowledgement = {
  id: string
  family_id: string
  cooking_acknowledged: boolean
  cooking_acknowledged_at: string | null
  receiving_acknowledged: boolean
  receiving_acknowledged_at: string | null
  created_at: string
  updated_at: string
}

export type Meal = {
  id: string
  village_id: string
  cook_family_id: string
  meal_name: string
  short_description: string | null
  meal_date: string
  pickup_start_time: string
  pickup_end_time: string
  total_portions: number
  reserved_portions: number
  ingredients_summary: string | null
  allergen_flags: string[]
  notes: string | null
  status: 'active' | 'canceled' | 'completed'
  created_at: string
  updated_at: string
  // Joined fields
  cook_family?: Family
}

export type Reservation = {
  id: string
  meal_id: string
  family_id: string
  village_id: string
  portion_count: number
  status: 'reserved' | 'confirmed' | 'canceled'
  confirmed_at: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  meal?: Meal
  family?: Family
}

export type Feedback = {
  id: string
  reservation_id: string
  meal_id: string
  from_family_id: string
  to_family_id: string
  sentiment: 'loved_it' | 'good' | 'okay'
  tags: string[]
  notes: string | null
  created_at: string
  // Joined
  from_family?: Family
  meal?: Meal
}

export type CreditLedgerEntry = {
  id: string
  family_id: string
  amount: number
  balance_after: number
  event_type: 'starter_credit' | 'reservation_deduction' | 'reservation_canceled_refund' | 'meal_cooked_earn' | 'meal_canceled_refund' | 'admin_adjustment'
  reference_id: string | null
  description: string | null
  created_at: string
}

export type ChatMessage = {
  id: string
  village_id: string
  family_id: string
  message: string
  created_at: string
  // Joined
  family?: Family
}

export type Notification = {
  id: string
  family_id: string
  type: string
  title: string
  body: string | null
  reference_id: string | null
  read: boolean
  created_at: string
}

export const ALLERGEN_OPTIONS = [
  'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts',
  'Peanuts', 'Wheat', 'Soy', 'Sesame', 'Gluten'
] as const

export const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Halal', 'Kosher',
  'Gluten-Free', 'Dairy-Free', 'Nut-Free'
] as const

export const FEEDBACK_TAGS = [
  'Kids loved it',
  'Too spicy',
  'Portion size good',
  'Would get again',
  'Great flavors',
  'Needed more seasoning',
  'Perfect for the family'
] as const

export const STARTER_CREDITS = 3
export const PORTION_UNIT_DESCRIPTION = '1 credit = 1 portion'
