# iOS Deployment Checklist

Config-level bugs and gaps have already been fixed in the codebase (Google Maps API key, unnecessary location permission removed, explicit photo library usage string, EAS project already linked — see git history for details). Everything below requires your own Apple Developer / EAS account and can't be done from a coding session.

## 1. Apple Developer account
- Confirm you have an active Apple Developer Program membership ($99/yr).
- Note your **Team ID** (Apple Developer portal → Membership).

## 2. EAS login
```
eas login
```
Confirm you're logged into the account that owns this project (`extra.eas.projectId` in `app.json` is already set to `2367f3f8-9676-4c60-95d5-c39c44bc065d`).

## 3. Create the App Store Connect app record
- In App Store Connect → My Apps → New App.
- Bundle ID: `com.getoneplot.app` (must match `app.json`'s `ios.bundleIdentifier`).
- Platform: iOS.
- Once created, copy the **App Store Connect App ID** (a numeric ID, e.g. `1234567890`) — you'll need it for step 5.

## 4. Set EAS environment variables for production
Do **not** hardcode these into `eas.json` (it's committed to git). Use `eas env:create` per variable, or the EAS dashboard (Project → Environment Variables), targeting the `production` environment (and `preview` if you want that profile working too). Pull the actual values from `getoneplotmobile/.env.local`:

**Client-bundled (`EXPO_PUBLIC_*`, safe to expose in the app binary):**
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `EXPO_PUBLIC_ARKESEL_SMS_API` (kept as a fallback in code; not used for the actual send anymore, see `notificationService.ts`)
- `EXPO_PUBLIC_COMPANY_NUMBER`
- `EXPO_PUBLIC_IMAGE_URL`, `EXPO_PUBLIC_IMAGE_LAND_URL`

**Server-only (used by `app/api/*+api.ts` routes when deployed):**
- `CLERK_SECRET_KEY`
- `ARKESEL_SMS_API`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_EMAIL`, `SMTP_FROM`

Example for one variable:
```
eas env:create --environment production --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "<value from .env.local>" --visibility sensitive
```
Repeat for each, or check `eas env --help` / the dashboard for bulk-import support.

## 5. Fill in `eas.json` submit config
Once step 3 gives you a real App Store Connect App ID, update `eas.json`:
```json
"submit": {
  "production": {
    "ios": {
      "ascAppId": "<your App Store Connect App ID>"
    }
  }
}
```
You'll also need either:
- `appleId` (your Apple ID email) in `eas.json` + `EXPO_APPLE_APP_SPECIFIC_PASSWORD` as an env var, or
- an App Store Connect API key (`ascApiKeyPath`, `ascApiKeyIssuerId`, `ascApiKeyId`) — recommended for CI/non-interactive submits.

## 6. App Store Connect listing requirements
- App description, keywords, support URL.
- Screenshots: 6.7" and 6.5" iPhone sizes are required minimum.
- Age rating questionnaire.
- Privacy Policy URL: `https://getoneplot.com/privacy` (already live).
- App Privacy "nutrition label": disclose photo library access (used for property listing photos). Location access should now be answered "No" — the unused `expo-location` dependency was removed.
- "Sign in with Apple" is already implemented (via Clerk, alongside Google) — required since another third-party social login is offered, so no extra work needed here.

## 7. Build and submit
```
eas build --platform ios --profile production
eas submit --platform ios --profile production
```
(Or set `"autoSubmit": true` on the production build profile to chain them.)

## 8. Recommended: TestFlight first
Distribute the production build to internal TestFlight testers before releasing publicly, to catch anything the review process wouldn't.
