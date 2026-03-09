-- Fix: infinite recursion in village_members RLS policy
-- Need a security definer function to get village IDs without triggering RLS

create or replace function public.get_my_village_ids()
returns setof uuid as $$
  select village_id from public.village_members
  where family_id = public.get_my_family_id();
$$ language sql stable security definer;

-- Drop and recreate the recursive policies
drop policy if exists "Members can view village members" on public.village_members;
drop policy if exists "Authenticated users can join villages" on public.village_members;

drop policy if exists "Village members can view meals" on public.meals;
drop policy if exists "Village members can view chat" on public.chat_messages;

-- VILLAGE MEMBERS - use security definer function
create policy "Members can view village members" on public.village_members
  for select using (
    village_id in (select public.get_my_village_ids())
  );

create policy "Authenticated users can join villages" on public.village_members
  for insert with check (
    family_id = public.get_my_family_id()
  );

-- MEALS - also used village_members subquery
create policy "Village members can view meals" on public.meals
  for select using (
    village_id in (select public.get_my_village_ids())
  );

-- CHAT - also used village_members subquery
create policy "Village members can view chat" on public.chat_messages
  for select using (
    village_id in (select public.get_my_village_ids())
  );
