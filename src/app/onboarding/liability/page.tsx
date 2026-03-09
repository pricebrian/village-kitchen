'use client'

import { useState } from 'react'
import { acknowledgeLiability } from '@/lib/actions/liability'
import { Shield } from 'lucide-react'

export default function LiabilityPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cookingChecked, setCookingChecked] = useState(false)
  const [receivingChecked, setReceivingChecked] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await acknowledgeLiability(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-green-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Community agreement</h1>
          <p className="mt-1 text-sm text-gray-600">Please review and accept before continuing</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700">
              These are MVP placeholder acknowledgements. They do not constitute legal advice.
              Consult a legal professional before launching a production service.
            </p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="flex gap-3 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-amber-50 transition-colors has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50">
                <input
                  type="checkbox"
                  name="cooking_acknowledged"
                  checked={cookingChecked}
                  onChange={(e) => setCookingChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Cooking acknowledgement</p>
                  <p className="mt-1 text-sm text-gray-600">
                    I understand that meals shared through Village Kitchen may be prepared in home
                    kitchens that have not been inspected by local health authorities. I agree to
                    follow safe food handling practices when cooking for my community.
                  </p>
                </div>
              </label>

              <label className="flex gap-3 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-amber-50 transition-colors has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50">
                <input
                  type="checkbox"
                  name="receiving_acknowledged"
                  checked={receivingChecked}
                  onChange={(e) => setReceivingChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Receiving acknowledgement</p>
                  <p className="mt-1 text-sm text-gray-600">
                    I acknowledge that I am voluntarily accepting and consuming food prepared by
                    other community members. I understand that Village Kitchen does not guarantee
                    the safety of any shared meals and I accept this responsibility.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !cookingChecked || !receivingChecked}
              className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'I agree — Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
