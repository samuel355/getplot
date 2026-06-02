# Mobile admin API (not the web app)

Admin user management uses this **standalone Node server**, not `app/api/users/` (that folder does not exist).

| Path | Handler |
|------|---------|
| `GET /api/users` | `clerkAdmin.mjs` → Clerk `getUserList()` |
| `POST /api/admin/update-user` | `clerkAdmin.mjs` → Clerk `updateUser()` |

## Run

**Normal development** (Expo + admin API together):

```bash
cd getoneplotmobile
npm run start
```

**Admin API only** (debugging Clerk / users endpoint):

```bash
npm run dev:api
```

Default URL: `http://localhost:8787`

On a physical device, add to `.env.local` (use your computer’s LAN IP from Metro):

```
EXPO_PUBLIC_MOBILE_API_URL=http://192.168.x.x:8787
```

Requires `CLERK_SECRET_KEY` in `.env.local` (same Clerk app as the mobile client).

The files `app/api/users+api.ts` are Expo Router API experiments; Metro was returning HTML for those routes, so the app uses this server instead.
