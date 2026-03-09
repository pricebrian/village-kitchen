import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { requireFamily, requireVillage, getChatMessages } from '@/lib/queries'
import { ChatFeed } from './chat-feed'

export default async function ChatPage() {
  const family = await requireFamily()
  const membership = await requireVillage(family.id)
  const messages = await getChatMessages(membership.village.id)

  return (
    <AppShell>
      <PageHeader
        title="Community chat"
        subtitle={membership.village.name}
      />
      <ChatFeed
        initialMessages={messages}
        villageId={membership.village.id}
        currentFamilyId={family.id}
      />
    </AppShell>
  )
}
