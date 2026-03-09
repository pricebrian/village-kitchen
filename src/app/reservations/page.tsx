import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { requireFamily, getMyReservations } from '@/lib/queries'
import { formatDate, formatTime } from '@/lib/utils'
import { CalendarCheck } from 'lucide-react'
import { ReservationActions } from './reservation-actions'

export default async function ReservationsPage() {
  const family = await requireFamily()
  const reservations = await getMyReservations(family.id)

  const active = reservations.filter(r => r.status === 'reserved')
  const confirmed = reservations.filter(r => r.status === 'confirmed')
  const canceled = reservations.filter(r => r.status === 'canceled')

  return (
    <AppShell>
      <PageHeader title="My meals" subtitle="Your reservations and pickups" />

      {reservations.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="w-10 h-10" />}
          title="No reservations yet"
          description="Reserve portions from meals your neighbors are cooking"
          action={
            <Link href="/dashboard" className="text-sm text-amber-700 font-medium hover:text-amber-800">
              Browse meals
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Upcoming ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((res) => (
                  <Card key={res.id}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link href={`/meals/${res.meal_id}`} className="font-semibold text-gray-900 hover:text-amber-700">
                            {res.meal?.meal_name}
                          </Link>
                          <p className="text-sm text-gray-600">
                            by {res.meal?.cook_family?.family_name}
                          </p>
                        </div>
                        <Badge variant="warning">Reserved</Badge>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {res.meal && formatDate(res.meal.meal_date)} &middot;{' '}
                        {res.meal && formatTime(res.meal.pickup_start_time)} – {res.meal && formatTime(res.meal.pickup_end_time)}
                        &middot; {res.portion_count} portion{res.portion_count > 1 ? 's' : ''}
                      </div>
                      <ReservationActions reservationId={res.id} mealStatus={res.meal?.status || 'active'} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {confirmed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Confirmed ({confirmed.length})
              </h2>
              <div className="space-y-3">
                {confirmed.map((res) => (
                  <Card key={res.id} className="opacity-75">
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{res.meal?.meal_name}</p>
                          <p className="text-sm text-gray-600">by {res.meal?.cook_family?.family_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {res.meal && formatDate(res.meal.meal_date)} &middot; {res.portion_count} portion{res.portion_count > 1 ? 's' : ''}
                          </p>
                        </div>
                        <Badge variant="success">Confirmed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {canceled.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Canceled ({canceled.length})
              </h2>
              <div className="space-y-3">
                {canceled.map((res) => (
                  <Card key={res.id} className="opacity-50">
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-700">{res.meal?.meal_name}</p>
                          <p className="text-xs text-gray-500">{res.portion_count} portion{res.portion_count > 1 ? 's' : ''}</p>
                        </div>
                        <Badge variant="danger">Canceled</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
