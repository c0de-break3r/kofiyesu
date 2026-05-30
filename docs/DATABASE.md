# Database (Neon + Prisma)

This app uses **Neon Postgres** with **Prisma** for all CMS and inquiry data. There is no Supabase client.

## Setup

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string (recommended for Vercel).
3. Add to `.env` and Vercel:

   ```bash
   DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

4. Apply schema and seed:

   ```bash
   npm run db:push
   npm run db:seed
   ```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run db:push` | Sync `prisma/schema.prisma` to Neon |
| `npm run db:seed` | Upsert default about + 3 projects |
| `npm run db:studio` | Prisma Studio GUI |

## Migrating from Supabase

If you had data in Supabase Postgres:

```bash
pg_dump "$OLD_SUPABASE_URL" --no-owner --no-acl -f backup.sql
npm run db:push
psql "$DATABASE_URL" -f backup.sql
```

Or skip the dump and run `npm run db:seed` on a fresh Neon database, then re-edit content in the admin CMS panel (✎ button when signed in as admin).

## Vercel

Set only `DATABASE_URL` for the database (plus Clerk, Gemini, Cloudinary, etc.). Remove any `SUPABASE_*` variables from the Vercel project.
