# BhashaLoop — Store Launch Checklist

Everything in the codebase is submission-ready. This checklist covers the parts that
need **accounts and credentials only you can create**. Work top to bottom; each step
says exactly where its output goes.

---

## 0. Already done (no action)

- [x] Bundle IDs: `com.bhashaloop.app` (iOS + Android) in `apps/mobile/app.json`
- [x] Icons, splash, adaptive icon in `apps/mobile/assets/`
- [x] EAS build profiles (dev / preview / production) in `apps/mobile/eas.json`
- [x] Store listing copy: `apps/mobile/store-listing.md` (name, subtitle, keywords, description)
- [x] Privacy policy hosted publicly: **https://flytrap-beep.github.io/bangla-learn/privacy**
- [x] Press kit live: https://1108514.us6.myftpupload.com/press/
- [x] IAP product IDs defined in code (`apps/mobile/lib/iap.ts`):
  - `com.bhashaloop.app.heart_refill` ($0.99)
  - `com.bhashaloop.app.streak_freeze` ($1.99)
  - `com.bhashaloop.app.xp_boost_2h` ($0.99)

---

## 1. Apple Developer account ($99/year)

1. Enroll at https://developer.apple.com/programs/enroll/ (needs your Apple ID + payment).
   Approval can take 24–48h.
2. Once approved, create the app in **App Store Connect** (https://appstoreconnect.apple.com):
   - My Apps → “+” → New App → platform iOS, bundle ID `com.bhashaloop.app`
   - Name: **BhashaLoop** (grab it early — names are first-come)
3. Collect three values and put them in `apps/mobile/eas.json` under `submit.production.ios`:
   ```jsonc
   "appleId":     "<the email of your Apple ID>",
   "ascAppId":    "<App Store Connect app ID — numeric, from the app's page URL>",
   "appleTeamId": "<Team ID — developer.apple.com → Membership>"
   ```
4. In App Store Connect → your app → **In-App Purchases**: create the 3 consumable/
   non-consumable products with EXACTLY the IDs listed in section 0 (heart_refill and
   xp_boost_2h = consumable; streak_freeze = consumable).
5. App Privacy questionnaire: declare **Contact Info (email), Identifiers (user ID),
   Usage Data (product interaction)** — all "app functionality", none used for tracking.
   Paste the privacy policy URL from section 0.

## 2. Google Play Console ($25 one-time)

1. Register at https://play.google.com/console/signup
2. Create app → name **BhashaLoop**, package `com.bhashaloop.app`.
3. Create a **service account key** for automated submission:
   Play Console → Setup → API access → create service account → download JSON →
   save it as `apps/mobile/google-play-service-account.json` (already gitignored;
   NEVER commit it).
4. Products → In-app products: create the same 3 product IDs as section 0.
5. Data safety form: same declarations as the Apple privacy questionnaire.

## 3. RevenueCat (free)

1. Sign up at https://app.revenuecat.com
2. Create a project "BhashaLoop"; add an iOS app (bundle `com.bhashaloop.app`) and an
   Android app (package `com.bhashaloop.app`).
3. Connect store credentials (App Store Connect API key; Play service account JSON).
4. Create an **Offering** containing the 3 products; attach store products to packages.
5. Copy the two SDK API keys into your build environment:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
   ```
   For EAS builds set them as EAS secrets: `eas secret:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_xxx` (repeat for Android).

## 4. Environment variables for the production build

Set as EAS secrets (`eas secret:create`) or in `eas.json` env blocks:

```
EXPO_PUBLIC_FIREBASE_API_KEY / _AUTH_DOMAIN / _PROJECT_ID / _STORAGE_BUCKET /
  _MESSAGING_SENDER_ID / _APP_ID          ← Firebase console → project settings
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID          ← Google Cloud console OAuth credentials
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_FACEBOOK_APP_ID               ← Meta developer console
EXPO_PUBLIC_REVENUECAT_IOS_KEY / _ANDROID_KEY   ← section 3
```

## 5. Build & submit

```bash
cd apps/mobile
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
# after builds succeed:
npx eas submit --platform ios --profile production
npx eas submit --platform android --profile production
```

## 6. Store assets (manual)

- [x] 6.9" screenshots started — `apps/mobile/store-assets/screenshots-6.9/` at
      1320×2868 (home dialect map, study card). Captured headlessly with
      `xcrun simctl io "iPhone 17 Pro Max" screenshot <path>`.
- [ ] Capture the remaining screens the same way: a quiz question, lesson results +
      Wrapped share card, the Bazaar. See `store-assets/README.md`.
- [ ] Feature graphic (Android, 1024×500) — can be derived from the press-kit hero.

## 7. Known follow-ups (post-launch, not blockers)

- Real contact email: the site/policy references `hello@banglaloop.com` — make sure this
  mailbox (or a forwarder to marwaanswar@gmail.com) actually exists before submission.
- Dialect-native recorded audio (research report: audio is the final authority).
- Ad-based heart refills (rate decision pending: 1 heart/15s vs /10s of ad watched).
- Leaderboard Cloud Function for tamper-proof rankings (client-push works for v1).
- WordPress MCP write path is broken (reads OK, create/update silently no-op) — site
  edits currently need the WP admin UI.
