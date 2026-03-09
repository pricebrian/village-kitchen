-- Village Kitchen MVP Schema
-- Run this in your Supabase SQL editor to set up the database

-- ============================================================
-- TABLES
-- ============================================================

-- Families (each auth user maps to one family)
create table public.families (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  family_name text not null,
  adults_count integer not null default 2 check (adults_count >= 1),
  kids_count integer not null default 0 check (kids_count >= 0),
  kids_ages text, -- optional free text e.g. "3, 7"
  allergies text[] default '{}',
  dietary_restrictions text[] default '{}',
  preferences text,
  picky_eater_level text not null default 'medium' check (picky_eater_level in ('low', 'medium', 'high')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Villages
create table public.villages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  zip_code text not null,
  description text,
  max_families integer not null default 8 check (max_families >= 2),
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  owner_family_id uuid references public.families(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Village members (junction table)
create table public.village_members (
  id uuid primary key default gen_random_uuid(),
  village_id uuid references public.villages(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique(village_id, family_id)
);

-- Liability acknowledgements
create table public.liability_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade not null,
  cooking_acknowledged boolean not null default false,
  cooking_acknowledged_at timestamptz,
  receiving_acknowledged boolean not null default false,
  receiving_acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(family_id)
);

-- Meals
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  village_id uuid references public.villages(id) on delete cascade not null,
  cook_family_id uuid references public.families(id) on delete cascade not null,
  meal_name text not null,
  short_description text,
  meal_date date not null,
  pickup_start_time timestamptz not null,
  pickup_end_time timestamptz not null,
  total_portions integer not null check (total_portions > 0),
  reserved_portions integer not null default 0 check (reserved_portions >= 0),
  ingredients_summary text,
  allergen_flags text[] default '{}',
  notes text,
  status text not null default 'active' check (status in ('active', 'canceled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Pickup end must be after pickup start
  check (pickup_end_time > pickup_start_time),
  -- Meal date must be consistent with pickup time
  check (reserved_portions <= total_portions)
);

-- Reservations
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid references public.meals(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  village_id uuid references public.villages(id) on delete cascade not null,
  portion_count integer not null check (portion_count > 0),
  status text not null default 'reserved' check (status in ('reserved', 'confirmed', 'canceled')),
  confirmed_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Feedback (private, from receiving family to cooking family)
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references public.reservations(id) on delete cascade not null unique,
  meal_id uuid references public.meals(id) on delete cascade not null,
  from_family_id uuid references public.families(id) on delete cascade not null,
  to_family_id uuid references public.families(id) on delete cascade not null,
  sentiment text not null check (sentiment in ('loved_it', 'good', 'okay')),
  tags text[] default '{}',
  notes text,
  created_at timestamptz not null default now()
);

-- Credit ledger
create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade not null,
  amount integer not null, -- positive = credit, negative = debit
  balance_after integer not null,
  event_type text not null check (event_type in ('starter_credit', 'reservation_deduction', 'reservation_canceled_refund', 'meal_cooked_earn', 'meal_canceled_refund', 'admin_adjustment')),
  reference_id uuid, -- meal_id or reservation_id
  description text,
  created_at timestamptz not null default now()
);

-- Chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  village_id uuid references public.villages(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Notifications (in-app)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text,
  reference_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_families_user_id on public.families(user_id);
create index idx_village_members_village_id on public.village_members(village_id);
create index idx_village_members_family_id on public.village_members(family_id);
create index idx_meals_village_id on public.meals(village_id);
create index idx_meals_cook_family_id on public.meals(cook_family_id);
create index idx_meals_meal_date on public.meals(meal_date);
create index idx_meals_status on public.meals(status);
create index idx_reservations_meal_id on public.reservations(meal_id);
create index idx_reservations_family_id on public.reservations(family_id);
create index idx_feedback_meal_id on public.feedback(meal_id);
create index idx_feedback_to_family_id on public.feedback(to_family_id);
create index idx_credit_ledger_family_id on public.credit_ledger(family_id);
create index idx_chat_messages_village_id on public.chat_messages(village_id);
create index idx_chat_messages_created_at on public.chat_messages(created_at);
create index idx_notifications_family_id on public.notifications(family_id);
create index idx_notifications_read on public.notifications(read);
create index idx_villages_invite_code on public.villages(invite_code);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Get credit balance for a family
create or replace function public.get_credit_balance(p_family_id uuid)
returns integer as $$
  select coalesce(
    (select balance_after from public.credit_ledger
     where family_id = p_family_id
     order by created_at desc limit 1),
    0
  );
$$ language sql stable;

-- Add a credit ledger entry (calculates balance_after automatically)
create or replace function public.add_credit_entry(
  p_family_id uuid,
  p_amount integer,
  p_event_type text,
  p_reference_id uuid default null,
  p_description text default null
) returns public.credit_ledger as $$
declare
  v_current_balance integer;
  v_new_entry public.credit_ledger;
begin
  -- Lock to prevent race conditions
  perform pg_advisory_xact_lock(hashtext(p_family_id::text));

  v_current_balance := public.get_credit_balance(p_family_id);

  insert into public.credit_ledger (family_id, amount, balance_after, event_type, reference_id, description)
  values (p_family_id, p_amount, v_current_balance + p_amount, p_event_type, p_reference_id, p_description)
  returning * into v_new_entry;

  return v_new_entry;
end;
$$ language plpgsql;

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger families_updated_at before update on public.families
  for each row execute function public.handle_updated_at();
create trigger villages_updated_at before update on public.villages
  for each row execute function public.handle_updated_at();
create trigger liability_acknowledgements_updated_at before update on public.liability_acknowledgements
  for each row execute function public.handle_updated_at();
create trigger meals_updated_at before update on public.meals
  for each row execute function public.handle_updated_at();
create trigger reservations_updated_at before update on public.reservations
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.families enable row level security;
alter table public.villages enable row level security;
alter table public.village_members enable row level security;
alter table public.liability_acknowledgements enable row level security;
alter table public.meals enable row level security;
alter table public.reservations enable row level security;
alter table public.feedback enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;

-- Families: users can read/write their own family
create policy "Users can view own family" on public.families
  for select using (auth.uid() = user_id);
create policy "Users can insert own family" on public.families
  for insert with check (auth.uid() = user_id);
create policy "Users can update own family" on public.families
  for update using (auth.uid() = user_id);

-- Families: village members can view each other
create policy "Village members can view each other" on public.families
  for select using (
    id in (
      select vm2.family_id from public.village_members vm1
      join public.village_members vm2 on vm1.village_id = vm2.village_id
      where vm1.family_id = (select id from public.families where user_id = auth.uid())
    )
  );

-- Villages: members can view their village
create policy "Village members can view village" on public.villages
  for select using (
    id in (select village_id from public.village_members where family_id = (select id from public.families where user_id = auth.uid()))
  );
create policy "Any authenticated user can view village by invite code" on public.villages
  for select using (auth.uid() is not null);
create policy "Authenticated users can create villages" on public.villages
  for insert with check (auth.uid() is not null);
create policy "Village owners can update" on public.villages
  for update using (
    owner_family_id = (select id from public.families where user_id = auth.uid())
  );

-- Village members
create policy "Members can view village members" on public.village_members
  for select using (
    village_id in (select village_id from public.village_members where family_id = (select id from public.families where user_id = auth.uid()))
  );
create policy "Authenticated users can join villages" on public.village_members
  for insert with check (
    family_id = (select id from public.families where user_id = auth.uid())
  );

-- Liability acknowledgements
create policy "Users manage own acknowledgements" on public.liability_acknowledgements
  for all using (
    family_id = (select id from public.families where user_id = auth.uid())
  );

-- Meals: village members can view, cooks can insert/update
create policy "Village members can view meals" on public.meals
  for select using (
    village_id in (select village_id from public.village_members where family_id = (select id from public.families where user_id = auth.uid()))
  );
create policy "Village members can post meals" on public.meals
  for insert with check (
    cook_family_id = (select id from public.families where user_id = auth.uid())
    and village_id in (select village_id from public.village_members where family_id = cook_family_id)
  );
create policy "Cooks can update own meals" on public.meals
  for update using (
    cook_family_id = (select id from public.families where user_id = auth.uid())
  );

-- Reservations
create policy "Users can view own reservations" on public.reservations
  for select using (
    family_id = (select id from public.families where user_id = auth.uid())
  );
create policy "Cooks can view reservations for their meals" on public.reservations
  for select using (
    meal_id in (select id from public.meals where cook_family_id = (select id from public.families where user_id = auth.uid()))
  );
create policy "Users can create reservations" on public.reservations
  for insert with check (
    family_id = (select id from public.families where user_id = auth.uid())
  );
create policy "Users can update own reservations" on public.reservations
  for update using (
    family_id = (select id from public.families where user_id = auth.uid())
  );
-- Cooks can also update reservations (for confirming)
create policy "Cooks can update reservations on their meals" on public.reservations
  for update using (
    meal_id in (select id from public.meals where cook_family_id = (select id from public.families where user_id = auth.uid()))
  );

-- Feedback: private between families
create policy "Feedback givers can view own feedback" on public.feedback
  for select using (
    from_family_id = (select id from public.families where user_id = auth.uid())
  );
create policy "Cooks can view feedback for their meals" on public.feedback
  for select using (
    to_family_id = (select id from public.families where user_id = auth.uid())
  );
create policy "Users can leave feedback" on public.feedback
  for insert with check (
    from_family_id = (select id from public.families where user_id = auth.uid())
  );

-- Credit ledger: users see own
create policy "Users can view own credit ledger" on public.credit_ledger
  for select using (
    family_id = (select id from public.families where user_id = auth.uid())
  );

-- Chat messages: village members
create policy "Village members can view chat" on public.chat_messages
  for select using (
    village_id in (select village_id from public.village_members where family_id = (select id from public.families where user_id = auth.uid()))
  );
create policy "Village members can send chat" on public.chat_messages
  for insert with check (
    family_id = (select id from public.families where user_id = auth.uid())
    and village_id in (select village_id from public.village_members where family_id = family_id)
  );

-- Notifications: users see own
create policy "Users can view own notifications" on public.notifications
  for select using (
    family_id = (select id from public.families where user_id = auth.uid())
  );
create policy "Users can update own notifications" on public.notifications
  for update using (
    family_id = (select id from public.families where user_id = auth.uid())
  );

-- Allow insert on notifications for server-side (service role)
-- In practice, notifications are created server-side
create policy "System can create notifications" on public.notifications
  for insert with check (true);

-- Allow insert on credit_ledger for the credit functions
create policy "System can create credit entries" on public.credit_ledger
  for insert with check (true);

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime for chat messages
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.notifications;
