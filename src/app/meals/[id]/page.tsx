import { notFound } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { requireFamily, getMeal, getMealReservations, getCreditBalance } from '@/lib/queries'
import { formatDate, formatTime, getRelativeTime } from '@/lib/utils'
import { PORTION_UNIT_DESCRIPTION } from '@/types/database'
import { Clock, Users, AlertTriangle } from 'lucide-react'
import { ReserveForm } from './reserve-form'
import { CancelMealButton } from './cancel-meal-button'

export default async function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const family = await requireFamily()
  const meal = await getMeal(id)

  if (!meal) notFound()

  const reservations = await getMealReservations(id)
  const balance = await getCreditBalance(family.id)
  const isCook = meal.cook_family_id === family.id
  const available = meal.total_portions - meal.reserved_portions
  const isPast = new Date(meal.pickup_end_time) < new Date()
  const hasReservation = reservations.some(r => r.family_id === family.id)

  return (
    <AppShell>
      <PageHeader
        title={meal.meal_name}
        subtitle={`by ${meal.cook_family?.family_name}`}
        backHref="/dashboard"
      />

      {meal.status === 'canceled' && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          This meal has been canceled.
        </div>
      )}

      {/* Meal details */}
      <Card className="mb-4">
        <CardContent className="space-y-4">
          {meal.short_description && (
            <p className="text-gray-700">{meal.short_description}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(meal.meal_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pickup window</p>
              <p className="text-sm font-medium text-gray-900">
                {formatTime(meal.pickup_start_time)} – {formatTime(meal.pickup_end_time)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Portions available</p>
              <p className="text-sm font-medium text-gray-900">
                <span className="text-amber-700 font-bold">{available}</span> of {meal.total_portions}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium">
                <span className={isPast ? 'text-gray-500' : 'text-green-700'}>
                  {isPast ? 'Past' : getRelativeTime(meal.pickup_start_time)}
                </span>
              </p>
            </div>
          </div>

          {meal.ingredients_summary && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Ingredients</p>
              <p className="text-sm text-gray-700">{meal.ingredients_summary}</p>
            </div>
          )}

          {meal.allergen_flags && meal.allergen_flags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Allergens</p>
              <div className="flex flex-wrap gap-1">
                {meal.allergen_flags.map((flag: string) => (
                  <Badge key={flag} variant="danger">{flag}</Badge>
                ))}
              </div>
            </div>
          )}

          {meal.notes && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{meal.notes}</p>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">{PORTION_UNIT_DESCRIPTION}</p>
          </div>
        </CardContent>
      </Card>

      {/* Reserve section */}
      {!isCook && meal.status === 'active' && !isPast && !hasReservation && available > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Reserve portions</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              You have <span className="font-bold text-amber-700">{balance}</span> credit{balance !== 1 ? 's' : ''} available.
            </p>
            <ReserveForm mealId={meal.id} available={available} balance={balance} />
          </CardContent>
        </Card>
      )}

      {hasReservation && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          You have a reservation for this meal. Check "My Meals" for details.
        </div>
      )}

      {/* Cook view: reservations list */}
      {isCook && reservations.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Reservations ({reservations.length})</h2>
            </div>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {reservations.map((res) => (
              <div key={res.id} className="px-4 py-3 sm:px-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{res.family?.family_name}</p>
                  <p className="text-xs text-gray-500">{res.portion_count} portion{res.portion_count > 1 ? 's' : ''}</p>
                </div>
                <Badge variant={res.status === 'confirmed' ? 'success' : res.status === 'canceled' ? 'danger' : 'warning'}>
                  {res.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cancel meal button for cook */}
      {isCook && meal.status === 'active' && !isPast && (
        <CancelMealButton mealId={meal.id} hasReservations={reservations.length > 0} />
      )}
    </AppShell>
  )
}
