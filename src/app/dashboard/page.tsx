import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { requireFamily, requireVillage, getUpcomingMeals, getCreditBalance, getVillageMembers, getUnreadNotificationCount } from '@/lib/queries'
import { formatDate, formatTime, getRelativeTime } from '@/lib/utils'
import { PORTION_UNIT_DESCRIPTION } from '@/types/database'
import { UtensilsCrossed, Plus, Users, Coins, Bell, ClipboardList, UserPen, Copy } from 'lucide-react'

export default async function DashboardPage() {
  const family = await requireFamily()
  const membership = await requireVillage(family.id)
  const village = membership.village
  const meals = await getUpcomingMeals(village.id)
  const balance = await getCreditBalance(family.id)
  const members = await getVillageMembers(village.id)
  const unreadCount = await getUnreadNotificationCount(family.id)

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{village.name}</h1>
            <p className="text-sm text-gray-500">{village.zip_code} &middot; {members.length}/{village.max_families} families</p>
          </div>
          {unreadCount > 0 && (
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Credit balance */}
      <Card className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white">
        <CardContent className="flex items-center justify-between py-5">
          <div>
            <p className="text-amber-100 text-sm font-medium">Your credits</p>
            <p className="text-3xl font-bold">{balance}</p>
            <p className="text-amber-200 text-xs mt-0.5">{PORTION_UNIT_DESCRIPTION}</p>
          </div>
          <Coins className="w-10 h-10 text-amber-200/50" />
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/meals/new"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
        >
          <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-amber-700" />
          </div>
          <span className="text-sm font-medium text-gray-900">Post a meal</span>
        </Link>
        <Link
          href="/reservations"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
        >
          <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-orange-700" />
          </div>
          <span className="text-sm font-medium text-gray-900">My meals</span>
        </Link>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
        >
          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
            <UserPen className="w-5 h-5 text-green-700" />
          </div>
          <span className="text-sm font-medium text-gray-900">Edit profile</span>
        </Link>
        <Link
          href="/dashboard/village"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
        >
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-700" />
          </div>
          <span className="text-sm font-medium text-gray-900">Village info</span>
        </Link>
      </div>

      {/* Upcoming meals */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming meals</h2>
        <Link href="/meals/new" className="text-sm text-amber-700 font-medium hover:text-amber-800">
          + Post meal
        </Link>
      </div>

      {meals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">No upcoming meals</p>
            <p className="text-xs text-gray-500 mt-1">Be the first to share a meal with your village!</p>
            <Link
              href="/meals/new"
              className="inline-flex items-center mt-4 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              Post a meal
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => {
            const available = meal.total_portions - meal.reserved_portions
            const isMine = meal.cook_family_id === family.id
            return (
              <Link key={meal.id} href={`/meals/${meal.id}`}>
                <Card className="hover:border-amber-300 transition-colors">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{meal.meal_name}</h3>
                          {isMine && <Badge variant="info">Your meal</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">
                          by {meal.cook_family?.family_name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{formatDate(meal.meal_date)}</span>
                          <span>{formatTime(meal.pickup_start_time)} – {formatTime(meal.pickup_end_time)}</span>
                          <span className="text-amber-600 font-medium">{getRelativeTime(meal.pickup_start_time)}</span>
                        </div>
                        {meal.allergen_flags && meal.allergen_flags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {meal.allergen_flags.map((flag: string) => (
                              <Badge key={flag} variant="danger">{flag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <p className="text-lg font-bold text-amber-700">{available}</p>
                        <p className="text-xs text-gray-500">left</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
