# Village Kitchen — MVP Setup Guide

## Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free tier works)

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a name, password, and region
3. Wait for the project to finish provisioning (~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/migrations/001_initial_schema.sql` from this repo
3. Copy the entire contents and paste it into the SQL Editor
4. Click **Run** — this creates all tables, indexes, RLS policies, functions, and triggers

> **Important:** If you get an error about `supabase_realtime` publication, that's okay — it means realtime is already configured. You can ignore it or remove those two lines.

## Step 3: Configure Supabase Auth

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled (it should be by default)
3. For local development, go to **Authentication** → **URL Configuration**:
   - Set **Site URL** to `http://localhost:3000`
   - Add `http://localhost:3000/auth/callback` to **Redirect URLs**

### Disable email confirmation (recommended for local dev):

1. Go to **Authentication** → **Email Templates** or **Settings**
2. Under **Email Auth**, toggle off "Confirm email" (or set it to auto-confirm)
3. This lets you sign up and immediately use the app without checking email

## Step 4: Get Your Supabase Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these three values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## Step 5: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Step 6: Install Dependencies & Run

```bash
npm install
npm run dev
```

The app will be running at **http://localhost:3000**

---

## Testing the Full Flow

### Quick test walkthrough:

1. **Sign up** at `/auth/signup` with any email/password
2. **Create your family profile** — fill in name, family size, dietary info
3. **Accept liability acknowledgements** — check both boxes
4. **Create a village** — give it a name and ZIP code
5. You'll land on the **dashboard** — note your 3 starter credits and invite code

### To test with multiple families:

1. Open an **incognito window** (or different browser)
2. Sign up with a different email
3. Create a family profile
4. Accept liability
5. **Join the village** using the invite code from the first family
6. Now both families can post meals, reserve portions, chat, etc.

### Full meal-sharing flow:

1. **Family A** posts a meal (must be 24+ hours from now)
2. **Family B** views the meal and reserves portions (credits deducted)
3. After the pickup time, **Family B** clicks "Confirm received" and leaves feedback
4. **Family A** earns credits — check the credits ledger
5. Both families can chat in the village chat

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Login, signup, callback
│   ├── onboarding/         # Profile, liability, village setup
│   ├── dashboard/          # Main dashboard, profile edit, village info
│   ├── meals/              # Post meal, meal detail
│   ├── reservations/       # My reservations with confirm/cancel
│   ├── credits/            # Credit balance and ledger
│   ├── chat/               # Village chat with realtime
│   ├── feedback/           # Cook's feedback view
│   └── api/auth/           # Signout route
├── components/
│   ├── ui/                 # Reusable UI components (Button, Card, Badge, etc.)
│   └── layout/             # App shell, page header
├── lib/
│   ├── supabase/           # Supabase client (browser, server, middleware)
│   ├── actions/            # Server actions (auth, family, village, meals, chat)
│   ├── queries.ts          # Server-side data fetching
│   └── utils.ts            # Utility functions
├── types/
│   └── database.ts         # TypeScript types and constants
└── middleware.ts            # Auth middleware
```
