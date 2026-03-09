import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { requireFamily, getCreditBalance, getCreditLedger } from '@/lib/queries'
import { Coins } from 'lucide-react'

const eventLabels: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' }> = {
  starter_credit: { label: 'Welcome bonus', variant: 'info' },
  reservation_deduction: { label: 'Reservation', variant: 'danger' },
  reservation_canceled_refund: { label: 'Refund', variant: 'success' },
  meal_cooked_earn: { label: 'Meal cooked', variant: 'success' },
  meal_canceled_refund: { label: 'Meal canceled', variant: 'warning' },
  admin_adjustment: { label: 'Adjustment', variant: 'info' },
}

export default async function CreditsPage() {
  const family = await requireFamily()
  const balance = await getCreditBalance(family.id)
  const ledger = await getCreditLedger(family.id)

  return (
    <AppShell>
      <PageHeader title="Credits" subtitle="Your credit balance and history" />

      {/* Balance card */}
      <Card className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white">
        <CardContent className="py-6 text-center">
          <Coins className="w-8 h-8 mx-auto text-amber-200/70 mb-2" />
          <p className="text-amber-100 text-sm font-medium">Portions available</p>
          <p className="text-4xl font-bold mt-1">{balance}</p>
          <p className="text-amber-200 text-xs mt-2">1 credit = 1 portion of a neighbor&apos;s meal</p>
        </CardContent>
      </Card>

      {/* How credits work */}
      <Card className="mb-6">
        <CardContent>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">How credits work</h3>
          <ul className="text-sm text-gray-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">+</span>
              <span>Earn credits when neighbors confirm receiving your meal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">-</span>
              <span>Spend credits to reserve portions from neighbors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">↺</span>
              <span>Get credits back if you or the cook cancels</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Ledger */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">History</h2>
        </CardHeader>
        {ledger.length === 0 ? (
          <CardContent>
            <p className="text-sm text-gray-500 text-center py-4">No transactions yet</p>
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-100">
            {ledger.map((entry) => {
              const info = eventLabels[entry.event_type] || { label: entry.event_type, variant: 'default' as const }
              const isPositive = entry.amount > 0
              return (
                <div key={entry.id} className="px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={info.variant}>{info.label}</Badge>
                    </div>
                    <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{entry.amount}
                    </span>
                  </div>
                  {entry.description && (
                    <p className="text-xs text-gray-500">{entry.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-400">Balance: {entry.balance_after}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </AppShell>
  )
}
