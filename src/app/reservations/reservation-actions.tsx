'use client'

import { useState } from 'react'
import { cancelReservation, confirmReceipt } from '@/lib/actions/meals'
import { FEEDBACK_TAGS } from '@/types/database'

export function ReservationActions({ reservationId, mealStatus }: { reservationId: string; mealStatus: string }) {
  const [mode, setMode] = useState<'actions' | 'confirm' | 'cancel'>('actions')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel() {
    setLoading(true)
    const result = await cancelReservation(reservationId)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleConfirm(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await confirmReceipt(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (mode === 'cancel') {
    return (
      <div className="bg-red-50 rounded-lg p-3">
        <p className="text-sm text-red-700 mb-2">Cancel this reservation and get your credits back?</p>
        {error && <p className="text-sm text-red-700 mb-2">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Canceling...' : 'Yes, cancel'}
          </button>
          <button
            onClick={() => setMode('actions')}
            className="flex-1 bg-white text-gray-700 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
          >
            Keep it
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'confirm') {
    return (
      <div className="bg-green-50 rounded-lg p-3">
        <form action={handleConfirm} className="space-y-3">
          <input type="hidden" name="reservation_id" value={reservationId} />

          <p className="text-sm font-medium text-green-800">Confirm receipt & leave feedback</p>
          {error && <p className="text-sm text-red-700">{error}</p>}

          <div>
            <p className="text-xs text-gray-600 mb-2">How was it?</p>
            <div className="flex gap-2">
              {[
                { value: 'loved_it', label: 'Loved it!', emoji: '😍' },
                { value: 'good', label: 'Good', emoji: '👍' },
                { value: 'okay', label: 'Okay', emoji: '😐' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex-1 text-center px-2 py-2 rounded-lg border border-gray-200 text-sm cursor-pointer hover:bg-amber-50 has-[:checked]:bg-amber-100 has-[:checked]:border-amber-400 transition-colors"
                >
                  <input type="radio" name="sentiment" value={opt.value} defaultChecked={opt.value === 'good'} className="sr-only" />
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="block text-xs mt-0.5">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-2">Tags (optional)</p>
            <div className="flex flex-wrap gap-1.5">
              {FEEDBACK_TAGS.map((tag) => (
                <label
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full border border-gray-200 text-xs cursor-pointer hover:bg-amber-50 has-[:checked]:bg-amber-100 has-[:checked]:border-amber-400 transition-colors"
                >
                  <input type="checkbox" name="tags" value={tag} className="sr-only" />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="text-xs text-gray-600">Notes (optional, private)</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Any notes for the cook..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Confirming...' : 'Confirm received'}
            </button>
            <button
              type="button"
              onClick={() => setMode('actions')}
              className="px-3 bg-white text-gray-700 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setMode('confirm')}
        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
      >
        Confirm received
      </button>
      <button
        onClick={() => setMode('cancel')}
        className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
