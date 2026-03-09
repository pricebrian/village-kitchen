'use client'

import { useState } from 'react'
import { cancelMeal } from '@/lib/actions/meals'

export function CancelMealButton({ mealId, hasReservations }: { mealId: string; hasReservations: boolean }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    await cancelMeal(mealId)
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="w-full py-2.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
      >
        Cancel this meal
      </button>
    )
  }

  return (
    <div className="bg-red-50 rounded-xl border border-red-200 p-4">
      <p className="text-sm text-red-700 mb-3">
        {hasReservations
          ? 'This will cancel all reservations and refund credits to those who reserved. Are you sure?'
          : 'Are you sure you want to cancel this meal?'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Canceling...' : 'Yes, cancel meal'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 bg-white text-gray-700 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Keep it
        </button>
      </div>
    </div>
  )
}
