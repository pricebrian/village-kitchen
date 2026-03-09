'use client'

import { useState } from 'react'
import { createMeal } from '@/lib/actions/meals'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { ALLERGEN_OPTIONS, PORTION_UNIT_DESCRIPTION } from '@/types/database'

export default function NewMealPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Default to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createMeal(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Post a meal"
        subtitle="Share what you're cooking with your village"
        backHref="/dashboard"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="meal_name" className="block text-sm font-medium text-gray-700 mb-1">
              Meal name
            </label>
            <input
              id="meal_name"
              name="meal_name"
              required
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="e.g. Chicken Tikka Masala with Rice"
            />
          </div>

          <div>
            <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
              Short description
            </label>
            <textarea
              id="short_description"
              name="short_description"
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="A brief description of the meal"
            />
          </div>

          <div>
            <label htmlFor="meal_date" className="block text-sm font-medium text-gray-700 mb-1">
              Meal date
            </label>
            <input
              id="meal_date"
              name="meal_date"
              type="date"
              required
              defaultValue={defaultDate}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 24 hours from now</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickup_start_time" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup starts
              </label>
              <input
                id="pickup_start_time"
                name="pickup_start_time"
                type="time"
                required
                defaultValue="17:00"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="pickup_end_time" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup ends
              </label>
              <input
                id="pickup_end_time"
                name="pickup_end_time"
                type="time"
                required
                defaultValue="19:00"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="total_portions" className="block text-sm font-medium text-gray-700 mb-1">
              Portions available
            </label>
            <input
              id="total_portions"
              name="total_portions"
              type="number"
              min="1"
              max="20"
              required
              defaultValue="4"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">{PORTION_UNIT_DESCRIPTION}</p>
          </div>

          <div>
            <label htmlFor="ingredients_summary" className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients
            </label>
            <textarea
              id="ingredients_summary"
              name="ingredients_summary"
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Main ingredients in the meal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergen flags</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((allergen) => (
                <label
                  key={allergen}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-sm cursor-pointer hover:bg-red-50 hover:border-red-300 has-[:checked]:bg-red-100 has-[:checked]:border-red-400 has-[:checked]:text-red-800 transition-colors"
                >
                  <input type="checkbox" name="allergen_flags" value={allergen} className="sr-only" />
                  {allergen}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Any other details (bring your own container, etc.)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium text-base hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Posting...' : 'Post meal'}
          </button>
        </form>
      </div>
    </AppShell>
  )
}
