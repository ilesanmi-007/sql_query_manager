# SQL Query Manager — Developer Quick Reference

A concise, beginner‑friendly guide to understand, run, extend and debug the sql-query-manager codebase.

---

## Purpose (one sentence)
Next.js app to create, version, tag, save and share SQL queries — local fallback storage with optional Supabase backend and role-based access (user/admin).

---

## Important files & folders
- src/app/page.tsx — Main query editor / home UI (client).  
- src/app/saved/page.tsx — Saved queries listing and user/admin UI.  
- src/app/auth/* — Sign-in / sign-up pages.  
- src/utils/* — export/import, SQL validation, tag manager.  
- supabase-schema.sql — DB schema + RLS policies for Supabase.  
- .env.local — Environment vars (Supabase, NextAuth).  
- src/types — TypeScript types (User, Query, QueryVersion).  
- package.json — scripts and dependencies.  
- README.md — this file.

---

## Quick start (macOS)
1. Install dependencies:
   ```bash
   cd /Users/ilesanmi/Playground/sql-query-manager
   npm install
   ```
2. Configure env:
   - Copy `.env.local.example` → `.env.local`.
   - Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (server only), NEXTAUTH_URL, NEXTAUTH_SECRET.
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Open: http://localhost:3000

---

## Database & Supabase (high level)
- Use Supabase Auth + a small profiles table (do not store raw passwords).
- Apply the SQL in `supabase-schema.sql` via Supabase SQL Editor or CLI.
- Create admin by creating an auth user (Auth → Users) and setting `is_admin = true` in `profiles`/`users` via SQL Editor (requires service role or Dashboard).

Seed admin example (run in SQL Editor after creating auth user):
```sql
INSERT INTO public.profiles (id, name, is_admin)
VALUES ('<AUTH_USER_ID>', 'Admin User', TRUE);
```

Notes:
- Store images in Supabase Storage; save storage paths in `queries.result_image`.
- Use `auth.uid()` in RLS policies to enforce owner/admin rules.

---

## Authentication & sessions
- Recommended: Supabase Auth or NextAuth with Supabase adapter.
- Ensure callbacks set user id into JWT/token and session:
  - jwt callback: set token.id = user.id || user.sub
  - session callback: set session.user.id = token.id
- Check session in browser:
  ```js
  fetch('/api/auth/session').then(r=>r.json()).then(console.log)
  ```

If session.user.id is missing:
- Verify NextAuth callbacks, env vars (NEXTAUTH_SECRET, NEXTAUTH_URL), and restart server.

---

## StorageManager adapter (concept)
Implement two adapters:
- LocalStorageManager — current browser fallback.
- SupabaseStorageManager — real backend.

Essential methods:
- register, login, logout, getCurrentUser
- saveQuery, listUserQueries, updateQuery, deleteQuery
- listPublicQueries, listAllQueries (admin)
- setQueryVisibility(queryId, visibility, userId)

Switch backend via env var presence (use Supabase when NEXT_PUBLIC_SUPABASE_URL is set).

---

## Queries data model (key fields)
- id, name, sql, description, result, result_image (storage path), user_id, visibility ('public'|'private'), created_at, last_edited, versions (JSON), current_version, tags, is_favorite.

---

## RLS & authorization (recommended policies)
- SELECT on queries: allow if visibility='public' OR auth.uid()=user_id OR user is admin.
- INSERT: require auth.uid() = user_id (or admin/server).
- UPDATE/DELETE: require auth.uid() = user_id (or admin).
- Admin-only actions: use service role or server endpoints.

---

## Frontend checklist (where to update)
- src/app/page.tsx: load currentUser on mount, show admin controls only when isAdmin, save queries with userId and visibility.
- src/app/saved/page.tsx: show listUserQueries(currentUser.id) and admin panel for listAllQueries.
- src/app/auth/*: implement register/login using StorageManager and show loading/error states.

---

## Testing
- Unit tests:
  - Auth flow (register/login/session persistence) — mock Supabase/adapter
  - Ownership enforcement (only owner can edit/delete/toggle visibility)
  - Public feed listing
- Test command:
  ```bash
  npm test
  ```

---

## Common commands & snippets
- Restart dev server:
  ```bash
  npm run dev
  ```
- Generate bcrypt hash (local seed):
  ```bash
  npx -p bcryptjs node -e "console.log(require('bcryptjs').hashSync('admin123', 12))"
  ```

---

## Troubleshooting checklist
- No session ID: check NextAuth callbacks, env vars, restart server.
- RLS blocking requests: use the Supabase SQL Editor policy tester; temporarily disable RLS for debugging.
- Missing API keys: Dashboard → Project Settings → API → reveal keys.
- Uploads not showing: verify storage bucket permissions and returned paths/URLs.
- Runtime JSX/parse errors: check component syntax and imports, restart dev server.

---

## Suggested roadmap (small)
1. Implement StorageManager adapter (local + Supabase).  
2. Integrate auth into UI and persist session.  
3. Add is_admin flag and admin dashboard.  
4. Add `visibility` with owner-only toggle and public feed.  
5. Add combined RLS policies and tests.  

---

If you want, I can:
- scaffold the StorageManager adapter files and method stubs, or
- produce the exact SQL migration for profiles + queries + RLS,
- inspect a specific file (NextAuth config) and propose exact edits.

Which do you want next?
```<!-- filepath: /Users/ilesanmi/Playground/sql-query-manager/README.md -->
# SQL Query Manager — Developer Quick Reference

A concise, beginner‑friendly guide to understand, run, extend and debug the sql-query-manager codebase.

---

## Purpose (one sentence)
Next.js app to create, version, tag, save and share SQL queries — local fallback storage with optional Supabase backend and role-based access (user/admin).

---

## Important files & folders
- src/app/page.tsx — Main query editor / home UI (client).  
- src/app/saved/page.tsx — Saved queries listing and user/admin UI.  
- src/app/auth/* — Sign-in / sign-up pages.  
- src/utils/* — export/import, SQL validation, tag manager.  
- supabase-schema.sql — DB schema + RLS policies for Supabase.  
- .env.local — Environment vars (Supabase, NextAuth).  
- src/types — TypeScript types (User, Query, QueryVersion).  
- package.json — scripts and dependencies.  
- README.md — this file.

---

## Quick start (macOS)
1. Install dependencies:
   ```bash
   cd /Users/ilesanmi/Playground/sql-query-manager
   npm install
   ```
2. Configure env:
   - Copy `.env.local.example` → `.env.local`.
   - Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (server only), NEXTAUTH_URL, NEXTAUTH_SECRET.
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Open: http://localhost:3000

---

## Database & Supabase (high level)
- Use Supabase Auth + a small profiles table (do not store raw passwords).
- Apply the SQL in `supabase-schema.sql` via Supabase SQL Editor or CLI.
- Create admin by creating an auth user (Auth → Users) and setting `is_admin = true` in `profiles`/`users` via SQL Editor (requires service role or Dashboard).

Seed admin example (run in SQL Editor after creating auth user):
```sql
INSERT INTO public.profiles (id, name, is_admin)
VALUES ('<AUTH_USER_ID>', 'Admin User', TRUE);
```

Notes:
- Store images in Supabase Storage; save storage paths in `queries.result_image`.
- Use `auth.uid()` in RLS policies to enforce owner/admin rules.

---

## Authentication & sessions
- Recommended: Supabase Auth or NextAuth with Supabase adapter.
- Ensure callbacks set user id into JWT/token and session:
  - jwt callback: set token.id = user.id || user.sub
  - session callback: set session.user.id = token.id
- Check session in browser:
  ```js
  fetch('/api/auth/session').then(r=>r.json()).then(console.log)
  ```

If session.user.id is missing:
- Verify NextAuth callbacks, env vars (NEXTAUTH_SECRET, NEXTAUTH_URL), and restart server.

---

## StorageManager adapter (concept)
Implement two adapters:
- LocalStorageManager — current browser fallback.
- SupabaseStorageManager — real backend.

Essential methods:
- register, login, logout, getCurrentUser
- saveQuery, listUserQueries, updateQuery, deleteQuery
- listPublicQueries, listAllQueries (admin)
- setQueryVisibility(queryId, visibility, userId)

Switch backend via env var presence (use Supabase when NEXT_PUBLIC_SUPABASE_URL is set).

---

## Queries data model (key fields)
- id, name, sql, description, result, result_image (storage path), user_id, visibility ('public'|'private'), created_at, last_edited, versions (JSON), current_version, tags, is_favorite.

---

## RLS & authorization (recommended policies)
- SELECT on queries: allow if visibility='public' OR auth.uid()=user_id OR user is admin.
- INSERT: require auth.uid() = user_id (or admin/server).
- UPDATE/DELETE: require auth.uid() = user_id (or admin).
- Admin-only actions: use service role or server endpoints.

---

## Frontend checklist (where to update)
- src/app/page.tsx: load currentUser on mount, show admin controls only when isAdmin, save queries with userId and visibility.
- src/app/saved/page.tsx: show listUserQueries(currentUser.id) and admin panel for listAllQueries.
- src/app/auth/*: implement register/login using StorageManager and show loading/error states.

---

## Testing
- Unit tests:
  - Auth flow (register/login/session persistence) — mock Supabase/adapter
  - Ownership enforcement (only owner can edit/delete/toggle visibility)
  - Public feed listing
- Test command:
  ```bash
  npm test
  ```

---

## Common commands & snippets
- Restart dev server:
  ```bash
  npm run dev
  ```
- Generate bcrypt hash (local seed):
  ```bash
  npx -p bcryptjs node -e "console.log(require('bcryptjs').hashSync('admin123', 12))"
  ```

---

## Troubleshooting checklist
- No session ID: check NextAuth callbacks, env vars, restart server.
- RLS blocking requests: use the Supabase SQL Editor policy tester; temporarily disable RLS for debugging.
- Missing API keys: Dashboard → Project Settings → API → reveal keys.
- Uploads not showing: verify storage bucket permissions and returned paths/URLs.
- Runtime JSX/parse errors: check component syntax and imports, restart dev server.

---

## Suggested roadmap (small)
1. Implement StorageManager adapter (local + Supabase).  
2. Integrate auth into UI and persist session.  
3. Add is_admin flag and admin dashboard.  
4. Add `visibility` with owner-only toggle and public feed.  
5. Add combined RLS policies and tests.  
