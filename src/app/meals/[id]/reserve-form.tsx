'use client'

import { useState } from 'react'
import { reserveMeal } from '@/lib/actions/meals'

export function ReserveForm({ mealId, available, balance }: { mealId: string; available: number; balance: number }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(1)
  const max = Math.min(available, balance)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await reserveMeal(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (balance === 0) {
    return (
      <p className="text-sm text-red-600">You don&apos;t have enough credits to reserve portions.</p>
    )
  }

  return (
    <form action={handleSubmit}>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <input type="hidden" name="meal_id" value={mealId} />
      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="portion_count" className="text-sm font-medium text-gray-700">
          Portions:
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCount(Math.max(1, count - 1))}
            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            -
          </button>
          <input
            type="number"
            id="portion_count"
            name="portion_count"
            min="1"
            max={max}
            value={count}
            onChange={(e) => setCount(Math.min(max, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 text-center rounded-lg border border-gray-300 px-2 py-1.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <button
            type="button"
            onClick={() => setCount(Math.min(max, count + 1))}
            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            +
          </button>
        </div>
        <span className="text-sm text-gray-500">= {count} credit{count > 1 ? 's' : ''}</span>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Reserving...' : `Reserve ${count} portion${count > 1 ? 's' : ''}`}
      </button>
    </form>
  )
}
