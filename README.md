# FiePa

**FairRent GH** — a Ghana-focused housing and tenancy companion.

FiePa is being developed to help tenants, students and landlords organise housing information, tenancy records and housing concerns. It is an independent support platform, not Ghana's Rent Control Department and not a source of official rent assessments or legal decisions.

## Current MVP foundation

- Email magic-link sign-in with Supabase Auth.
- Protected dashboard routes with verified Supabase claims.
- Submit a housing concern and view the signed-in user's own reports.
- Landlord property page to create and review owned property records.
- Initial database tables for profiles, properties, tenancies, rent receipts, complaints, evidence, disputes and rent-assessment preparation.
- Row Level Security and least-privilege table permissions.

## Run locally

1. Install Node.js and npm.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local`.
4. Set the Supabase project URL and publishable key in `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   ```

5. In Supabase Authentication URL Configuration, set the local Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to the allowed redirect URLs.
6. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

For deployment, add the deployed site's origin and `/auth/callback` to Supabase's allowed redirect URLs and configure the same environment variables in the hosting provider.

## Database migrations

The migrations under `supabase/migrations` are aligned with the migration history of the connected FiePa Supabase project:

- `20261127104852_initial_fiepa_schema.sql`
- `20261127110953_harden_rls_and_role_permissions.sql`
- `20261127111042_lock_down_new_user_trigger_function.sql`
- `20261127111143_require_landlord_role_for_property_management.sql`

The current database uses RLS on all application tables. Anonymous table access is revoked. A user cannot change their own account role; landlord/admin roles must be assigned by a trusted administrator. Only approved landlords and administrators can manage property listings.

## Security and privacy notes

- Never place a Supabase secret/service-role key in browser code or a `NEXT_PUBLIC_*` variable.
- Never ask users for Mobile Money PINs or OTPs. Payment processing is not implemented.
- Housing reports should avoid unnecessary sensitive personal details. Add evidence uploads only after storage access rules and retention controls are configured.
- Do not present FiePa rent-assessment preparation as official approval or a legal determination.
- Do not use student reports in ways that expose students to retaliation.

## Not production-complete yet

The current code is an MVP foundation, not a finished housing marketplace or dispute-resolution service. Role-request/approval screens, tenancy invitations and acceptance, digital agreements, receipt workflows, secure evidence storage, moderation tools, fair-rent data, accessibility testing and end-to-end tests remain to be built and tested before public launch.
