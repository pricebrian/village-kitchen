'use client'

import { useState } from 'react'
import { createVillage, joinVillage } from '@/lib/actions/village'
import { Users, Plus, ArrowRight } from 'lucide-react'

export default function VillageOnboardingPage() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createVillage(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleJoin(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await joinVillage(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-amber-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join your village</h1>
          <p className="mt-1 text-sm text-gray-600">Create a new village or join with an invite code</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {mode === 'choose' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('join')}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left hover:border-amber-300 hover:bg-amber-50/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">I have an invite code</h3>
                  <p className="mt-1 text-sm text-gray-600">Join an existing village from a friend or neighbor</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </button>

            <button
              onClick={() => setMode('create')}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left hover:border-amber-300 hover:bg-amber-50/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Create a new village</h3>
                  <p className="mt-1 text-sm text-gray-600">Start a village and invite families to join</p>
                </div>
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <button onClick={() => { setMode('choose'); setError(null) }} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
              &larr; Back
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter invite code</h2>
            <form action={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="invite_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Invite code
                </label>
                <input
                  id="invite_code"
                  name="invite_code"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 font-mono text-lg tracking-wider text-center focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="abc12345"
                  maxLength={12}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Joining...' : 'Join village'}
              </button>
            </form>
          </div>
        )}

        {mode === 'create' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <button onClick={() => { setMode('choose'); setError(null) }} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
              &larr; Back
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create your village</h2>
            <form action={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Village name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g. Maple Street Families"
                />
              </div>
              <div>
                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP code
                </label>
                <input
                  id="zip_code"
                  name="zip_code"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="90210"
                  maxLength={10}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="A little about your village..."
                />
              </div>
              <div>
                <label htmlFor="max_families" className="block text-sm font-medium text-gray-700 mb-1">
                  Max families
                </label>
                <input
                  id="max_families"
                  name="max_families"
                  type="number"
                  min="2"
                  max="20"
                  defaultValue="8"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create village'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
