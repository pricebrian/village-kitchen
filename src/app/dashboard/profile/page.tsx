'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateFamilyProfile } from '@/lib/actions/family'
import { signOut } from '@/lib/actions/auth'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { ALLERGEN_OPTIONS, DIETARY_OPTIONS, type Family } from '@/types/database'

export default function EditProfilePage() {
  const [family, setFamily] = useState<Family | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('families')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setFamily(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    const result = await updateFamilyProfile(formData)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader title="Edit profile" backHref="/dashboard" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="family_name" className="block text-sm font-medium text-gray-700 mb-1">Family name</label>
            <input
              id="family_name"
              name="family_name"
              required
              defaultValue={family?.family_name}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="adults_count" className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <input id="adults_count" name="adults_count" type="number" min="1" max="10" defaultValue={family?.adults_count} required className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div>
              <label htmlFor="kids_count" className="block text-sm font-medium text-gray-700 mb-1">Kids</label>
              <input id="kids_count" name="kids_count" type="number" min="0" max="20" defaultValue={family?.kids_count} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
            </div>
          </div>

          <div>
            <label htmlFor="kids_ages" className="block text-sm font-medium text-gray-700 mb-1">Kids ages</label>
            <input id="kids_ages" name="kids_ages" defaultValue={family?.kids_ages || ''} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="e.g. 3, 7, 12" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((allergy) => (
                <label key={allergy} className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-sm cursor-pointer hover:bg-red-50 hover:border-red-300 has-[:checked]:bg-red-100 has-[:checked]:border-red-400 has-[:checked]:text-red-800 transition-colors">
                  <input type="checkbox" name="allergies" value={allergy} defaultChecked={family?.allergies?.includes(allergy)} className="sr-only" />
                  {allergy}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary restrictions</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((diet) => (
                <label key={diet} className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-sm cursor-pointer hover:bg-amber-50 hover:border-amber-300 has-[:checked]:bg-amber-100 has-[:checked]:border-amber-400 has-[:checked]:text-amber-800 transition-colors">
                  <input type="checkbox" name="dietary_restrictions" value={diet} defaultChecked={family?.dietary_restrictions?.includes(diet)} className="sr-only" />
                  {diet}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="picky_eater_level" className="block text-sm font-medium text-gray-700 mb-1">Picky eater level</label>
            <select id="picky_eater_level" name="picky_eater_level" defaultValue={family?.picky_eater_level} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              <option value="low">Low — We eat almost anything!</option>
              <option value="medium">Medium — Some preferences</option>
              <option value="high">High — Very selective eaters</option>
            </select>
          </div>

          <div>
            <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1">Preferences</label>
            <textarea id="preferences" name="preferences" rows={2} defaultValue={family?.preferences || ''} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="notes" name="notes" rows={2} defaultValue={family?.notes || ''} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <form action={signOut}>
          <button type="submit" className="text-sm text-red-600 hover:text-red-700 font-medium">
            Sign out
          </button>
        </form>
      </div>
    </AppShell>
  )
}
