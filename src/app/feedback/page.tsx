import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { requireFamily, getFeedbackForCook } from '@/lib/queries'
import { formatDate } from '@/lib/utils'
import { MessageSquareHeart } from 'lucide-react'

const sentimentDisplay: Record<string, { label: string; emoji: string }> = {
  loved_it: { label: 'Loved it', emoji: '😍' },
  good: { label: 'Good', emoji: '👍' },
  okay: { label: 'Okay', emoji: '😐' },
}

export default async function FeedbackPage() {
  const family = await requireFamily()
  const feedback = await getFeedbackForCook(family.id)

  return (
    <AppShell>
      <PageHeader
        title="My feedback"
        subtitle="Private feedback from families who received your meals"
        backHref="/dashboard"
      />

      {feedback.length === 0 ? (
        <EmptyState
          icon={<MessageSquareHeart className="w-10 h-10" />}
          title="No feedback yet"
          description="When families confirm receiving your meals, their feedback will appear here."
        />
      ) : (
        <div className="space-y-3">
          {feedback.map((fb) => {
            const sentiment = sentimentDisplay[fb.sentiment] || { label: fb.sentiment, emoji: '' }
            return (
              <Card key={fb.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{fb.meal?.meal_name}</p>
                      <p className="text-xs text-gray-500">
                        {fb.meal && formatDate(fb.meal.meal_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{sentiment.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{sentiment.label}</span>
                    </div>
                  </div>

                  {fb.tags && fb.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {fb.tags.map((tag: string) => (
                        <Badge key={tag} variant="default">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {fb.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                      {fb.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
