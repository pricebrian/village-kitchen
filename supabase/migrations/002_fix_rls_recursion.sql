-- Fix: infinite recursion in families RLS policy
-- The issue is that policies on "families" reference "families" in subqueries,
-- causing a recursive loop. The fix is a SECURITY DEFINER function that
-- bypasses RLS to look up the current user's family_id.

-- Helper function: get current user's family_id (bypasses RLS)
create or replace function public.get_my_family_id()
returns uuid as $$
  select id from public.families where user_id = auth.uid() limit 1;
$$ language sql stable security definer;

-- Drop all existing policies that cause recursion
drop policy if exists "Users can view own family" on public.families;
drop policy if exists "Users can insert own family" on public.families;
drop policy if exists "Users can update own family" on public.families;
drop policy if exists "Village members can view each other" on public.families;

drop policy if exists "Village members can view village" on public.villages;
drop policy if exists "Any authenticated user can view village by invite code" on public.villages;
drop policy if exists "Authenticated users can create villages" on public.villages;
drop policy if exists "Village owners can update" on public.villages;

drop policy if exists "Members can view village members" on public.village_members;
drop policy if exists "Authenticated users can join villages" on public.village_members;

drop policy if exists "Users manage own acknowledgements" on public.liability_acknowledgements;

drop policy if exists "Village members can view meals" on public.meals;
drop policy if exists "Village members can post meals" on public.meals;
drop policy if exists "Cooks can update own meals" on public.meals;

drop policy if exists "Users can view own reservations" on public.reservations;
drop policy if exists "Cooks can view reservations for their meals" on public.reservations;
drop policy if exists "Users can create reservations" on public.reservations;
drop policy if exists "Users can update own reservations" on public.reservations;
drop policy if exists "Cooks can update reservations on their meals" on public.reservations;

drop policy if exists "Feedback givers can view own feedback" on public.feedback;
drop policy if exists "Cooks can view feedback for their meals" on public.feedback;
drop policy if exists "Users can leave feedback" on public.feedback;

drop policy if exists "Users can view own credit ledger" on public.credit_ledger;

drop policy if exists "Village members can view chat" on public.chat_messages;
drop policy if exists "Village members can send chat" on public.chat_messages;

drop policy if exists "Users can view own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;
drop policy if exists "System can create notifications" on public.notifications;
drop policy if exists "System can create credit entries" on public.credit_ledger;

-- ============================================================
-- RECREATE ALL POLICIES using get_my_family_id()
-- ============================================================

-- FAMILIES
create policy "Users can view own family" on public.families
  for select using (auth.uid() = user_id);

create policy "Village members can view each other" on public.families
  for select using (
    id in (
      select vm2.family_id from public.village_members vm1
      join public.village_members vm2 on vm1.village_id = vm2.village_id
      where vm1.family_id = public.get_my_family_id()
    )
  );

create policy "Users can insert own family" on public.families
  for insert with check (auth.uid() = user_id);

create policy "Users can update own family" on public.families
  for update using (auth.uid() = user_id);

-- VILLAGES
create policy "Any authenticated user can view villages" on public.villages
  for select using (auth.uid() is not null);

create policy "Authenticated users can create villages" on public.villages
  for insert with check (auth.uid() is not null);

create policy "Village owners can update" on public.villages
  for update using (
    owner_family_id = public.get_my_family_id()
  );

-- VILLAGE MEMBERS
create policy "Members can view village members" on public.village_members
  for select using (
    village_id in (
      select village_id from public.village_members where family_id = public.get_my_family_id()
    )
  );

create policy "Authenticated users can join villages" on public.village_members
  for insert with check (
    family_id = public.get_my_family_id()
  );

-- LIABILITY ACKNOWLEDGEMENTS
create policy "Users manage own acknowledgements" on public.liability_acknowledgements
  for all using (
    family_id = public.get_my_family_id()
  );

-- MEALS
create policy "Village members can view meals" on public.meals
  for select using (
    village_id in (
      select village_id from public.village_members where family_id = public.get_my_family_id()
    )
  );

create policy "Village members can post meals" on public.meals
  for insert with check (
    cook_family_id = public.get_my_family_id()
  );

create policy "Cooks can update own meals" on public.meals
  for update using (
    cook_family_id = public.get_my_family_id()
  );

-- RESERVATIONS
create policy "Users can view own reservations" on public.reservations
  for select using (
    family_id = public.get_my_family_id()
  );

create policy "Cooks can view reservations for their meals" on public.reservations
  for select using (
    meal_id in (
      select id from public.meals where cook_family_id = public.get_my_family_id()
    )
  );

create policy "Users can create reservations" on public.reservations
  for insert with check (
    family_id = public.get_my_family_id()
  );

create policy "Users can update own reservations" on public.reservations
  for update using (
    family_id = public.get_my_family_id()
  );

create policy "Cooks can update reservations on their meals" on public.reservations
  for update using (
    meal_id in (
      select id from public.meals where cook_family_id = public.get_my_family_id()
    )
  );

-- FEEDBACK
create policy "Feedback givers can view own feedback" on public.feedback
  for select using (
    from_family_id = public.get_my_family_id()
  );

create policy "Cooks can view feedback for their meals" on public.feedback
  for select using (
    to_family_id = public.get_my_family_id()
  );

create policy "Users can leave feedback" on public.feedback
  for insert with check (
    from_family_id = public.get_my_family_id()
  );

-- CREDIT LEDGER
create policy "Users can view own credit ledger" on public.credit_ledger
  for select using (
    family_id = public.get_my_family_id()
  );

create policy "System can create credit entries" on public.credit_ledger
  for insert with check (true);

-- CHAT MESSAGES
create policy "Village members can view chat" on public.chat_messages
  for select using (
    village_id in (
      select village_id from public.village_members where family_id = public.get_my_family_id()
    )
  );

create policy "Village members can send chat" on public.chat_messages
  for insert with check (
    family_id = public.get_my_family_id()
  );

-- NOTIFICATIONS
create policy "Users can view own notifications" on public.notifications
  for select using (
    family_id = public.get_my_family_id()
  );

create policy "Users can update own notifications" on public.notifications
  for update using (
    family_id = public.get_my_family_id()
  );

create policy "System can create notifications" on public.notifications
  for insert with check (true);
