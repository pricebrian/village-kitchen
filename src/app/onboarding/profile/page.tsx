'use client'

import { useState } from 'react'
import { createFamilyProfile } from '@/lib/actions/family'
import { ALLERGEN_OPTIONS, DIETARY_OPTIONS } from '@/types/database'
import { UtensilsCrossed } from 'lucide-react'

export default function ProfileOnboardingPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createFamilyProfile(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tell us about your household</h1>
          <p className="mt-1 text-sm text-gray-600">This helps your neighbors know your needs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="family_name" className="block text-sm font-medium text-gray-700 mb-1">
                Household name
              </label>
              <input
                id="family_name"
                name="family_name"
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="The Smiths"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="adults_count" className="block text-sm font-medium text-gray-700 mb-1">
                  Adults
                </label>
                <input
                  id="adults_count"
                  name="adults_count"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="2"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="kids_count" className="block text-sm font-medium text-gray-700 mb-1">
                  Kids
                </label>
                <input
                  id="kids_count"
                  name="kids_count"
                  type="number"
                  min="0"
                  max="20"
                  defaultValue="0"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="kids_ages" className="block text-sm font-medium text-gray-700 mb-1">
                Kids ages (optional)
              </label>
              <input
                id="kids_ages"
                name="kids_ages"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g. 3, 7, 12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((allergy) => (
                  <label
                    key={allergy}
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-sm cursor-pointer hover:bg-red-50 hover:border-red-300 has-[:checked]:bg-red-100 has-[:checked]:border-red-400 has-[:checked]:text-red-800 transition-colors"
                  >
                    <input type="checkbox" name="allergies" value={allergy} className="sr-only" />
                    {allergy}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary restrictions</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((diet) => (
                  <label
                    key={diet}
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-sm cursor-pointer hover:bg-amber-50 hover:border-amber-300 has-[:checked]:bg-amber-100 has-[:checked]:border-amber-400 has-[:checked]:text-amber-800 transition-colors"
                  >
                    <input type="checkbox" name="dietary_restrictions" value={diet} className="sr-only" />
                    {diet}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="picky_eater_level" className="block text-sm font-medium text-gray-700 mb-1">
                Picky eater level
              </label>
              <select
                id="picky_eater_level"
                name="picky_eater_level"
                defaultValue="medium"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="low">Low — We eat almost anything!</option>
                <option value="medium">Medium — Some preferences</option>
                <option value="high">High — Very selective eaters</option>
              </select>
            </div>

            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1">
                Food preferences (optional)
              </label>
              <textarea
                id="preferences"
                name="preferences"
                rows={2}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g. Love Italian food, prefer mild flavors"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Anything else? (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Anything else your neighbors should know"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
