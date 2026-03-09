import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { requireFamily, requireVillage, getVillageMembers } from '@/lib/queries'
import { Users } from 'lucide-react'

export default async function CommunityInfoPage() {
  const family = await requireFamily()
  const membership = await requireVillage(family.id)
  const village = membership.village
  const members = await getVillageMembers(village.id)

  return (
    <AppShell>
      <PageHeader
        title={village.name}
        subtitle="Community information"
        backHref="/dashboard"
      />

      <div className="space-y-4">
        {/* Invite code */}
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-gray-700 mb-2">Invite code</p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-mono font-bold text-amber-700 tracking-wider">
                {village.invite_code}
              </code>
              <p className="text-xs text-gray-500">Share this code with neighbors you want to invite</p>
            </div>
          </CardContent>
        </Card>

        {/* Community details */}
        <Card>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">ZIP code</p>
              <p className="text-sm font-medium text-gray-900">{village.zip_code}</p>
            </div>
            {village.description && (
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-gray-900">{village.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Capacity</p>
              <p className="text-sm font-medium text-gray-900">{members.length} / {village.max_families} households</p>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Households</h2>
            </div>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div key={member.id} className="px-4 py-3 sm:px-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.family?.family_name}</p>
                  <p className="text-xs text-gray-500">
                    {member.family?.adults_count} adult{member.family?.adults_count !== 1 ? 's' : ''}
                    {member.family?.kids_count > 0 && `, ${member.family.kids_count} kid${member.family.kids_count !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === 'owner' && <Badge variant="warning">Owner</Badge>}
                  {member.family_id === family.id && <Badge variant="info">You</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
