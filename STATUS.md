# Village Kitchen MVP — Status & Summary

## What Is Village Kitchen

Village Kitchen is an invite-only private village network for families to coordinate home-cooked meal sharing. No money, no delivery, no public marketplace — just trusted neighbors sharing food through a credit system.

---

## Architecture

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Auth:** Supabase email/password authentication
- **Data access:** Server actions for mutations, server components for reads
- **Realtime:** Supabase Realtime for chat messages
- **Security:** Row Level Security (RLS) on all tables
- **PWA:** Manifest and meta tags in place for future installability

## Database Schema

| Table | Purpose |
|-------|---------|
| `families` | Family profiles linked to auth users |
| `villages` | Private village groups |
| `village_members` | Family-village membership (with roles) |
| `liability_acknowledgements` | Cooking/receiving liability sign-offs |
| `meals` | Meal postings with portions and pickup windows |
| `reservations` | Portion reservations with status tracking |
| `feedback` | Private sentiment + tags from receivers to cooks |
| `credit_ledger` | Append-only credit transaction log |
| `chat_messages` | Village chat messages |
| `notifications` | In-app notifications |

Key database features:
- `add_credit_entry()` function with advisory locks to prevent race conditions
- `get_credit_balance()` function for fast balance lookups
- `updated_at` triggers on mutable tables
- Comprehensive RLS policies for data isolation
- Realtime enabled for `chat_messages` and `notifications`

---

## What Is Fully Implemented

### Authentication
- [x] Email/password signup and login
- [x] Session handling via Supabase SSR middleware
- [x] Protected routes (redirect to login if unauthenticated)
- [x] Onboarding flow detection (profile → liability → village)
- [x] Sign out

### Family Profile
- [x] Create family profile during onboarding
- [x] Edit family profile from dashboard
- [x] All fields: name, adults, kids, ages, allergies, dietary restrictions, picky eater level, preferences, notes
- [x] Chip-style multi-select for allergies and dietary restrictions

### Villages
- [x] Create a village (with auto-generated invite code)
- [x] Join a village via invite code
- [x] Village capacity enforcement
- [x] Village info page with invite code and member list
- [x] Owner/member roles
- [x] Starter credits (3) granted on joining

### Meals
- [x] Post a meal with all fields (name, description, date, pickup window, portions, ingredients, allergens, notes)
- [x] 24-hour advance posting validation
- [x] Pickup window validation
- [x] Upcoming meals list on dashboard (grouped by village)
- [x] Meal detail page with full info
- [x] Cancel meal (by cook) with automatic refund of all reservations

### Reservations
- [x] Reserve portions from a meal
- [x] Credit balance check before reservation
- [x] Available portions check
- [x] Credits deducted immediately on reservation
- [x] Cancel reservation with credit refund
- [x] Reservation status tracking (reserved → confirmed / canceled)
- [x] "My Meals" page showing all reservations by status
- [x] Prevent reserving your own meal

### Confirmation & Feedback
- [x] "Confirm received" flow on reservations
- [x] Sentiment rating (loved it / good / okay)
- [x] Tag-based feedback (kids loved it, too spicy, portion size good, etc.)
- [x] Free-text private notes
- [x] Cook earns credits on confirmation
- [x] Feedback page for cooks to see all private feedback
- [x] Feedback is fully private (not visible to other village members)

### Credits
- [x] Starter credits on village join (3 credits)
- [x] Deduction on reservation
- [x] Refund on cancellation (by reserver or by cook)
- [x] Earning on meal confirmation
- [x] Full ledger with balance tracking
- [x] Credit balance prominently displayed on dashboard
- [x] Credits page with balance, how-it-works explainer, and full history
- [x] Race condition protection via advisory locks

### Liability Acknowledgements
- [x] Cooking acknowledgement
- [x] Receiving acknowledgement
- [x] Boolean + timestamp storage
- [x] Required before accessing meal features
- [x] Clearly labeled as MVP placeholders

### Village Chat
- [x] Single chat feed per village
- [x] Plain text messages
- [x] Supabase Realtime subscription for live updates
- [x] Auto-scroll to bottom on new messages
- [x] Family name display on messages
- [x] Timestamp display

### Notifications
- [x] Notifications table and in-app surface
- [x] Notification creation on: new reservation, meal canceled, receipt confirmed
- [x] Unread count badge on dashboard
- [x] Mark as read functionality (server action)

### UI / UX
- [x] Warm amber/orange color palette
- [x] Mobile-first responsive design
- [x] Bottom navigation bar (mobile) / sidebar (desktop)
- [x] Card-based layout
- [x] Chip-style multi-select inputs
- [x] Loading states on forms
- [x] Error handling and display
- [x] Empty states with helpful prompts
- [x] Badge components for status indicators
- [x] PWA manifest and meta tags

---

## What Is Stubbed or Placeholder

| Feature | Status | Notes |
|---------|--------|-------|
| Liability text | Placeholder | Clearly labeled as MVP, needs real legal review |
| PWA icons | Missing | Need 192x192 and 512x512 icon PNGs |
| Email notifications | Not built | In-app only; add Supabase Edge Functions or Resend later |
| SMS notifications | Not built | Add Twilio or similar later |
| Notification dropdown UI | Basic | Only shows unread count; could add a full dropdown |
| Portion unit enforcement | Display only | Shows the definition but doesn't enforce kid/adult math |
| Weekly calendar view | Not built | Meals are listed chronologically; add a week grid later |

---

## Key Assumptions Made

1. **One village per family** for MVP — the schema supports multi-village but the app enforces single membership
2. **Credits deducted immediately** on reservation (not held/escrowed) — simpler and more predictable
3. **No email confirmation required** — recommended to disable in Supabase for dev; production should enable it
4. **Invite codes are 8-character hex strings** — auto-generated, case-insensitive
5. **Anyone in a village can post meals** — no cook/receiver role distinction
6. **Feedback is always optional** — confirmation can happen without leaving feedback
7. **Service role key** is used server-side for credit operations that need to bypass RLS
8. **Supabase free tier** is sufficient for MVP testing

---

## Top 10 Next Improvements After MVP

1. **Email/push notifications** — Supabase Edge Functions + Resend for transactional emails (cooking tomorrow, pickup soon, confirm receipt reminders)

2. **Weekly calendar view** — Visual week grid showing meals by day, making it easy to plan the week at a glance

3. **Photo uploads for meals** — Supabase Storage for meal photos; huge for engagement and trust

4. **Village admin panel** — Owner can remove members, adjust credits, edit village settings, transfer ownership

5. **Multi-village support** — Allow families to belong to multiple villages (e.g., neighborhood + school group)

6. **Full PWA with service worker** — Offline support, install prompt, push notifications via web push

7. **Recurring meal scheduling** — "I cook every Tuesday" with auto-posting and templates

8. **Dietary match warnings** — Alert when a family with peanut allergies tries to reserve a meal flagged with peanuts

9. **Family-to-family messaging (DMs)** — Private coordination between cook and receiver beyond village chat

10. **Analytics dashboard for village health** — Meals shared per week, active families, credit flow metrics to help validate the MVP hypothesis
